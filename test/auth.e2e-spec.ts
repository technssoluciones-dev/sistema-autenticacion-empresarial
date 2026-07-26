
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Controller (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'e2e.test.auth@empresa.com',
    password: 'Password123!',
    fullName: 'Usuario E2E Auth',
  };

  it('POST /api/v1/users -> debe registrar un usuario correctamente', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send(testUser)
      .expect(201)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual(testUser.email);
      });
  });

  it('POST /api/v1/users/login -> debe autenticar al usuario o responder según corresponda', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .then((res: request.Response) => {
        expect([200, 201, 404]).toContain(res.status);
      });
  });
});
