import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

import { UserOrmEntity } from './modules/users/infrastructure/persistence/user.orm-entity';
import { RefreshTokenOrmEntity } from './modules/users/infrastructure/persistence/refresh-token.orm-entity';
import { Role } from './modules/roles/domain/entities/role.entity';
import { AuditLogOrmEntity } from './modules/audit/infrastructure/persistence/audit-log.orm-entity';

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({ isInitialized: true, destroy: jest.fn() })
      .overrideProvider(getRepositoryToken(UserOrmEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(RefreshTokenOrmEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Role))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuditLogOrmEntity))
      .useValue({});

    moduleRef = await builder.compile();
  }, 15000);

  it('deberia compilar el modulo correctamente', () => {
    expect(moduleRef).toBeDefined();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
