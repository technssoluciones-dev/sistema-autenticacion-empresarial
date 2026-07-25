@'
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Conexión a PostgreSQL vía TypeORM. Mismo patrón que `LoggerModule`:
 * un `forRootAsync` que lee la config ya validada por Joi
 * (`env.validation.ts`) en vez de leer `process.env` directamente acá.
 *
 * `synchronize` NUNCA se deriva directamente de `DB_SYNC` en producción,
 * aunque alguien lo deje en `true` en el `.env` de un servidor real:
 * `synchronize: true` en producción puede borrar o alterar columnas con
 * datos reales sin pasar por una migración revisada. Se fuerza `false`
 * fuera de `development`/`test` sin excepción.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        const isProduction = env === 'production';
        const sync = configService.get<boolean>('database.sync') ?? false;

        // eslint-disable-next-line no-console
        console.log('[DEBUG DatabaseModule]', {
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          name: configService.get('database.name'),
        });


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

'@ | Out-File -Encoding utf8 src\infrastructure\database\database.module.ts
$c = Get-Content -Raw src\infrastructure\database\database.module.ts
[System.IO.File]::WriteAllText("$PWD\src\infrastructure\database\database.module.ts", $c, (New-Object System.Text.UTF8Encoding($false)))
