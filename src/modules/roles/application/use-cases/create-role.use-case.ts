
import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@shared/application/use-case.interface';
import { Result } from '@shared/application/result';
import { Role } from '../../domain/entities/role.entity';
import { PermissionName } from '../../domain/value-objects/permission-name.vo';
import { IRoleRepository, ROLE_REPOSITORY } from '../../domain/repositories/role.repository.interface';
import { CreateRoleRequestDto, RoleResponseDto } from '../dto/create-role.dto';

@Injectable()
export class CreateRoleUseCase implements UseCase<CreateRoleRequestDto, Result<RoleResponseDto>> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(request: CreateRoleRequestDto): Promise<Result<RoleResponseDto>> {
    try {
      const existing = await this.roleRepository.findByName(request.name);
      if (existing) {
        return Result.fail(new Error(`El rol '${request.name}' ya existe.`));
      }

      const permissionNameVOs = request.permissions.map((p) => PermissionName.create(p));
      const role = Role.create({
        name: request.name.toUpperCase(),
        description: request.description,
        permissions: permissionNameVOs,
      });

      await this.roleRepository.save(role);

      return Result.ok({
        id: role.id.toString(),
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => p.value),
        createdAt: role.createdAt,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al crear el rol.'));
    }
  }
}
