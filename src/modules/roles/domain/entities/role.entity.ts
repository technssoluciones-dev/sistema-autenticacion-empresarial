import { AggregateRoot } from '@shared/domain/aggregate-root';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';
import { PermissionName } from '../value-objects/permission-name.vo';

export interface RoleProps {
  name: string;
  description?: string;
  permissions: PermissionName[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends AggregateRoot<RoleProps> {
  private constructor(props: RoleProps, id?: UniqueEntityId) {
    super(
      {
        ...props,
        permissions: props.permissions || [],
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date(),
      },
      id,
    );
  }

  public static create(
    props: Omit<RoleProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId,
  ): Role {
    return new Role(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get permissions(): PermissionName[] {
    return this.props.permissions;
  }

  public hasPermission(permission: string): boolean {
    return this.props.permissions.some((p) => p.value === permission.toLowerCase());
  }

  public addPermission(permission: PermissionName): void {
    if (!this.hasPermission(permission.value)) {
      this.props.permissions.push(permission);
      this.props.updatedAt = new Date();
    }
  }
}
