process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { UserOrmEntity } from './modules/users/infrastructure/persistence/user.orm-entity';

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(UserOrmEntity))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        count: jest.fn(),
      })
      .compile();
  });

  it('should compile the module graph', () => {
    expect(moduleRef).toBeDefined();
  });
});