import { Role } from './role.entity';
import { PermissionName } from '../value-objects/permission-name.vo';

describe('Role Entity', () => {
  it('debe crear un rol correctamente con sus permisos', () => {
    const perm = PermissionName.create('users:read');
    const role = Role.create({
      name: 'ADMIN',
      permissions: [perm],
    });

    expect(role.name).toBe('ADMIN');
    expect(role.hasPermission('users:read')).toBe(true);
    expect(role.hasPermission('users:write')).toBe(false);
  });
});
