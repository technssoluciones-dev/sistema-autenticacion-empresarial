import 'reflect-metadata';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createIsolatedApp, closeIsolatedApp, TestContext } from './test-utils';

describe('Users (e2e)', () => {
  let context: TestContext | undefined;
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    context = await createIsolatedApp();
    app = context.app;
    dataSource = context.dataSource;

    // Ajustes adicionales específicos de esta suite
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  }, 30000);

  afterAll(async () => {
    await closeIsolatedApp(context);
  }, 30000);

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
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