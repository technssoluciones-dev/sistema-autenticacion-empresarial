import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Encabezados de Seguridad (Helmet)
  app.use(helmet());

  // 2. Configuración de CORS segura
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // 3. Pipes de Validación Global Sanitizados
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Enterprise Auth API')
    .setDescription(
      'Sistema de Autenticación Empresarial con Arquitectura Hexagonal, DDD y Hardening OWASP',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}/api/v1`);
  console.log(`📄 Documentación Swagger disponible en: http://localhost:${port}/docs`);
}

bootstrap();
