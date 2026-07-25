process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

import { Global, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { DatabaseModule } from './infrastructure/database/database.module';

/**
 * Este test solo verifica que el GRAFO de mÃ³dulos compile (que todas las
 * dependencias se puedan resolver) â€” no que la conexiÃ³n real a Postgres
 * funcione, eso es responsabilidad de un test e2e con base de datos real
 * (docker-compose). Por eso se sobreescribe `DatabaseModule`: sin esto,
 * `TypeOrmModule.forRootAsync` intenta abrir una conexiÃ³n real durante
 * `compile()` y el test queda colgado hasta hacer timeout.
 *
 * `FakeDatabaseModule` provee un `DataSource` falso bajo el mismo token
 * que usa `@nestjs/typeorm` (`getDataSourceToken()`), con un
 * `getRepository()` que devuelve un objeto vacÃ­o â€” suficiente para que
 * `TypeOrmModule.forFeature([UserOrmEntity])` (dentro de `UsersModule`)
 * pueda instanciar sus providers sin fallar.
 */
const fakeDataSource = {
  getRepository: () => ({}),
  entityMetadatas: [],
  isInitialized: true,
  options: {},
};

@Global()
@Module({
  providers: [{ provide: getDataSourceToken(), useValue: fakeDataSource }],
  exports: [getDataSourceToken()],
})
class FakeDatabaseModule {}

process.env.DB_HOST = 'localhost';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_ACCESS_SECRET = 'a'.repeat(32);
process.env.JWT_REFRESH_SECRET = 'b'.repeat(32);

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)
      .compile();
  });

  it('should compile the module graph', () => {
    expect(moduleRef).toBeDefined();
  });
});
