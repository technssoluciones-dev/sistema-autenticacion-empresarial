import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { createIsolatedApp, closeIsolatedApp, TestContext } from './test-utils';

describe('Auth Controller (E2E)', () => {
  let context: TestContext | undefined;
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: `e2e.test.auth.${Date.now()}@empresa.com`,
    password: 'Password123!',
    fullName: 'Usuario E2E Auth',
  };

  beforeAll(async () => {
    context = await createIsolatedApp();
    app = context.app;
    dataSource = context.dataSource;
  }, 30000);

  afterAll(async () => {
    await closeIsolatedApp(context);
  }, 30000);

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
  });

  describe('POST /api/v1/users (registro)', () => {
    it('debe registrar un usuario correctamente y devolver 201', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toEqual(testUser.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('debe devolver 409 si el email ya está registrado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(testUser)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send(testUser)
        .expect(409);
    });

    it('debe devolver 400 si falta un campo requerido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ email: 'incompleto@empresa.com' })
        .expect(400);
    });

    it('debe devolver 400 si el payload trae propiedades no permitidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({ ...testUser, email: 'otro@empresa.com', rolAdmin: true })
        .expect(400);
    });
  });

  describe('POST /api/v1/users/login (autenticación)', () => {
    it('debe autenticar con credenciales válidas y devolver 200 con tokens', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(testUser)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('debe devolver 401 si la contraseña es incorrecta', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(testUser)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({ email: testUser.email, password: 'ContraseñaIncorrecta1!' })
        .expect(401);
    });

    it('debe devolver 401 si el usuario no existe', () => {
      // Nota: la app devuelve 401 (no 404) para no revelar si el email existe
      return request(app.getHttpServer())
        .post('/api/v1/users/login')
        .send({ email: 'no.existe@empresa.com', password: 'Password123!' })
        .expect(401);
    });
  });
});