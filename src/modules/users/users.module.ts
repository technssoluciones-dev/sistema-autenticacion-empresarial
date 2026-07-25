import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisterUserUseCase } from './application/use-cases/register-user/register-user.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { PASSWORD_HASHER } from './domain/services/password-hasher.interface';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { UsersController } from './presentation/controllers/users.controller';

/**
 * Conecta las cuatro capas del mÃ³dulo. Los puertos (`USER_REPOSITORY`,
 * `PASSWORD_HASHER`) definidos en `domain` se ligan acÃ¡ a sus
 * implementaciones concretas de `infrastructure` â€” este es el Ãºnico
 * lugar del mÃ³dulo que conoce ambos lados a la vez.
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    RegisterUserUseCase,
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
  ],
})
export class UsersModule {}
