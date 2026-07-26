import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { CreateRoleDto } from '../dtos/create-role.dto';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly createRoleUseCase: CreateRoleUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 210, description: 'Rol creado exitosamente.' })
  async create(@Body() dto: CreateRoleDto) {
    return await this.createRoleUseCase.execute({
      name: dto.name,
      permissions: dto.permissions,
    });
  }
}
