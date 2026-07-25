import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * ConexiÃ³n a PostgreSQL vÃ­a TypeORM. Mismo patrÃ³n que `LoggerModule`:
 * un `forRootAsync` que lee la config ya validada por Joi
 * (`env.validation.ts`) en vez de leer `process.env` directamente acÃ¡.
 *
 * `synchronize` NUNCA se deriva directamente de `DB_SYNC` en producciÃ³n,
 * aunque alguien lo deje en `true` en el `.env` de un servidor real:
 * `synchronize: true` en producciÃ³n puede borrar o alterar columnas con
 * datos reales sin pasar por una migraciÃ³n revisada. Se fuerza `false`
 * fuera de `development`/`test` sin excepciÃ³n.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        const isProduction = env === 'production';
        const sync = configService.get<boolean>('database.sync') ?? false;

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: isProduction ? false : sync,
          logging: configService.get<boolean>('database.logging') ?? false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
