import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

/**
 * Logger estructurado en JSON (listo para ELK / CloudWatch / Datadog).
 * En desarrollo se formatea con pino-pretty para lectura humana.
 * Cada request recibe un requestId trazable de punta a punta.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        const logLevel = configService.get<string>('app.logLevel');
        const isProduction = env === 'production';

        return {
          pinoHttp: {
            level: logLevel,
            genReqId: (req: { headers: Record<string, unknown> }) =>
              (req.headers['x-request-id'] as string) ?? randomUUID(),
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                  },
                },
            autoLogging: true,
            redact: ['req.headers.authorization', 'req.headers.cookie'],
          },
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
