# E2E real contra Postgres (docker-compose)
# Ejecutar desde la raiz del proyecto

npm install -D @types/supertest

New-Item -ItemType Directory -Force -Path "test"

@'
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@modules/(.*)$": "<rootDir>/../src/modules/$1",
    "^@shared/(.*)$": "<rootDir>/../src/shared/$1",
    "^@config/(.*)$": "<rootDir>/../src/config/$1",
    "^@common/(.*)$": "<rootDir>/../src/common/$1"
  }
}

'@ | Out-File -Encoding utf8 "test\jest-e2e.json"

@'
import 'reflect-metadata';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/shared/filters/http-exception.filter';

/**
 * E2E real: levanta la app completa (incluido `DatabaseModule`) contra
 * una Postgres real — no hay mocks acá, a propósito. Requiere:
 *
 *   1. `docker-compose up -d postgres`
 *   2. `.env` con `DB_SYNC=true` (así TypeORM crea la tabla `users` solo,
 *      sin necesitar migraciones todavía — ver nota de seguridad en
 *      `DatabaseModule`: esto NUNCA se activa en producción, ahí queda
 *      forzado a `false` sin importar el valor de `DB_SYNC`).
 *
 * Corre con: npm run test:e2e
 */
describe('Users (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    dataSource = moduleRef.get(DataSource);
  });

  beforeEach(async () => {
    // Limpia la tabla entre tests para que cada uno arranque desde cero
    // (independiente del orden, sin depender de que el test anterior
    // haya corrido o no).
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
    await app.close();
  });

  it('POST /api/v1/users registra un usuario nuevo y devuelve 201 con el DTO esperado', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'nuevo@example.com',
      password: 'unPasswordSeguro123',
      fullName: 'Nombre Apellido',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        email: 'nuevo@example.com',
        fullName: 'Nombre Apellido',
      }),
    );
    expect(response.body.id).toBeDefined();
    // El hash del password nunca debe viajar en la respuesta HTTP.
    expect(response.body.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('persiste el usuario realmente en la tabla (no solo en la respuesta HTTP)', async () => {
    await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'persistido@example.com',
      password: 'unPasswordSeguro123',
      fullName: 'Usuario Persistido',
    });

    const rows = await dataSource.query('SELECT * FROM "users" WHERE email = $1', [
      'persistido@example.com',
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].password_hash).toMatch(/^\$2b\$/);
  });

  it('POST /api/v1/users con un email duplicado devuelve 409 Conflict', async () => {
    await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'duplicado@example.com',
      password: 'unPasswordSeguro123',
      fullName: 'Primer Registro',
    });

    const response = await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'duplicado@example.com',
      password: 'otroPasswordSeguro456',
      fullName: 'Segundo Intento',
    });

    expect(response.status).toBe(409);
  });

  it('POST /api/v1/users con email inválido devuelve 400 Bad Request (class-validator)', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'esto-no-es-un-email',
      password: 'unPasswordSeguro123',
      fullName: 'Nombre Apellido',
    });

    expect(response.status).toBe(400);
  });

  it('POST /api/v1/users con password corto devuelve 400 Bad Request', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/users').send({
      email: 'password-corto@example.com',
      password: '123',
      fullName: 'Nombre Apellido',
    });

    expect(response.status).toBe(400);
  });
});

'@ | Out-File -Encoding utf8 "test\users.e2e-spec.ts"

npx eslint "test/**/*.ts" --fix