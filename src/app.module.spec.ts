import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';

import { UserOrmEntity } from './modules/users/infrastructure/persistence/user.orm-entity';
import { RefreshToken } from './modules/users/domain/entities/refresh-token.entity';
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
      .overrideProvider(getRepositoryToken(RefreshToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Role))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuditLogOrmEntity))
      .useValue({});

    moduleRef = await builder.compile();
  }, 15000);

  it('deber�a compilar el m�dulo correctamente', () => {
    expect(moduleRef).toBeDefined();
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
});
