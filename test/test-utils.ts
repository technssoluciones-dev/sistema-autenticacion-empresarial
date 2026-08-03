import 'tsconfig-paths/register';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
  dbName: string;
}

/**
 * Filtro de excepciones para tests E2E.
 * Mapea excepciones de dominio a códigos HTTP y respeta las excepciones
 * nativas de NestJS (BadRequestException, etc.).
 */
@Catch()
class E2EExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // ── Excepciones HTTP nativas de NestJS (ValidationPipe, etc.) ──
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      response.status(status).json(
        typeof res === 'string'
          ? { statusCode: status, message: res }
          : res,
      );
      return;
    }

    // ── Excepciones de dominio personalizadas ──
    const name = exception?.constructor?.name || '';
    const message = exception?.message || 'Internal server error';

    const statusMap: Record<string, number> = {
      UserAlreadyExistsException: 409,
      InvalidCredentialsException: 401,
      UserNotFoundException: 404,
    };

    const status = statusMap[name] || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message,
      error: name || 'InternalServerError',
    });
  }
}

/**
 * Crea una app NestJS con su propia base de datos PostgreSQL aislada.
 * Cada llamada genera una DB única para evitar conflictos entre suites.
 */
export async function createIsolatedApp(): Promise<TestContext> {
  // ── PASO 1: Generar nombre único de base de datos ──
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const dbName = `test_e2e_${timestamp}_${random}`;

  // ── PASO 2: Crear la base de datos vía conexión admin ──
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5433,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
    synchronize: false,
    logging: false,
  });

  await adminDataSource.initialize();
  await adminDataSource.query(`CREATE DATABASE "${dbName}"`);
  await adminDataSource.destroy();
  console.log(`🗄️  DB creada: ${dbName}`);

  // ── PASO 3: Setear variables de entorno ANTES de importar AppModule ──
  process.env.DB_NAME = dbName;
  process.env.DB_SYNC = 'true';
  process.env.DB_LOGGING = 'false';

  // ── PASO 4: Importar AppModule dinámicamente ──
  const { AppModule } = await import('../src/app.module');

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // ← Filtro E2E que respeta HttpException nativas y mapea excepciones de dominio
  app.useGlobalFilters(new E2EExceptionFilter());
  await app.init();

  const dataSource = moduleRef.get(DataSource);

  // Sincroniza tablas (cada suite tiene su DB propia, sin race conditions)
  await dataSource.synchronize(true);

  return { app, dataSource, dbName };
}

/**
 * Cierra la app y destruye la base de datos aislada.
 */
export async function closeIsolatedApp(
  context: TestContext | undefined,
): Promise<void> {
  if (!context) {
    console.log('⚠️  closeIsolatedApp: context es undefined, omitiendo cleanup');
    return;
  }

  const { app, dbName } = context;

  // Cierra la app primero (esto cierra también la conexión de TypeORM)
  if (app) {
    await app.close();
  }

  // Conecta a postgres para dropear la DB temporal
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5433,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
    synchronize: false,
    logging: false,
  });

  try {
    await adminDataSource.initialize();

    await adminDataSource.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid()
    `);

    await adminDataSource.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`🗑️  DB destruida: ${dbName}`);
  } catch (err) {
    console.error(`❌ Error destruyendo DB ${dbName}:`, err);
  } finally {
    if (adminDataSource.isInitialized) {
      await adminDataSource.destroy();
    }
  }
}