import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { ACCESS_TOKEN_SERVICE } from './domain/services/access-token.service.interface';
import { REFRESH_TOKEN_GENERATOR } from './domain/services/refresh-token-generator.interface';
import { TOKEN_HASHER } from './domain/services/token-hasher.interface';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { TypeOrmRefreshTokenRepository } from './infrastructure/persistence/typeorm-refresh-token.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtAccessTokenService } from './infrastructure/services/jwt-access-token.service';
import { UuidRefreshTokenGenerator } from './infrastructure/services/uuid-refresh-token-generator';
import { Sha256TokenHasher } from './infrastructure/services/sha256-token-hasher';
import { UsersController } from './presentation/controllers/users.controller';

/**
 * Conecta las cuatro capas del modulo. Los puertos (USER_REPOSITORY,
 * PASSWORD_HASHER, etc.) definidos en domain se ligan aca a sus
 * implementaciones concretas de infrastructure - este es el unico
 * lugar del modulo que conoce ambos lados a la vez.
 *
 * JwtModule usa registerAsync + ConfigService en vez de leer
 * process.env directo: register() es sincrono y se ejecuta al importar
 * el archivo, antes de que ConfigModule.forRoot() cargue el .env -
 * asi el secret siempre llegaria undefined.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        } as any,
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: TypeOrmRefreshTokenRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: ACCESS_TOKEN_SERVICE, useClass: JwtAccessTokenService },
    { provide: REFRESH_TOKEN_GENERATOR, useClass: UuidRefreshTokenGenerator },
    { provide: TOKEN_HASHER, useClass: Sha256TokenHasher },
  ],
})
export class UsersModule {}
