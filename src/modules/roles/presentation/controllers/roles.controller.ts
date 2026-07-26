
import { Body, Controller, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.use-case';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly createRoleUseCase: CreateRoleUseCase) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Crear un nuevo rol con permisos (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o el rol ya existe.' })
  async create(@Body() dto: CreateRoleDto) {
    const result = await this.createRoleUseCase.execute(dto);
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue().message);
    }
    return result.getValue();
  }
}
