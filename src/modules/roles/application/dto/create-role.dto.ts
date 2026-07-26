
export class CreateRoleRequestDto {
  name: string;
  description?: string;
  permissions: string[];
}

export class RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
}
