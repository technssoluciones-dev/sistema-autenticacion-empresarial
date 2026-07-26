import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrmEntity } from './modules/users/infrastructure/persistence/user.orm-entity';
import { RefreshToken } from './modules/users/domain/entities/refresh-token.entity';
import { Role } from './modules/roles/domain/entities/role.entity';
import { DataSource } from 'typeorm';

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({ isInitialized: true, destroy: jest.fn() })
      .overrideProvider(getRepositoryToken(UserOrmEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(RefreshToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Role))
      .useValue({})
      .compile();
  }, 15000);

  it('debería compilar el módulo correctamente', () => {
    expect(moduleRef).toBeDefined();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
