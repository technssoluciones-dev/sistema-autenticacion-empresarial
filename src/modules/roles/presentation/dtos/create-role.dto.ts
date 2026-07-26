
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Nombre único del rol' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Administrador del sistema', description: 'Descripción opcional', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['users:read', 'users:write'], description: 'Lista de permisos asociados' })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
