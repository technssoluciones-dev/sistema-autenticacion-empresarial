import { Module } from '@nestjs/common';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository.interface';
import { InMemoryRoleRepository } from './infrastructure/persistence/in-memory-role.repository';
import { RolesController } from './presentation/controllers/roles.controller';
import { RolesGuard } from './infrastructure/guards/roles.guard';

@Module({
  controllers: [RolesController],
  providers: [
    CreateRoleUseCase,
    RolesGuard,
    {
      provide: ROLE_REPOSITORY,
      useClass: InMemoryRoleRepository,
    },
  ],
  exports: [ROLE_REPOSITORY, RolesGuard],
})
export class RolesModule {}
