import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'EDITOR', description: 'Nombre único del rol' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: ['users:read', 'users:write'],
    description: 'Lista de permisos asignados al rol',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions!: string[];
}
