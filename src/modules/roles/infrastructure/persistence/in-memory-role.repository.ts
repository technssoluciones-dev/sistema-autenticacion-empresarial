
import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class InMemoryRoleRepository implements IRoleRepository {
  private roles: Map<string, Role> = new Map();

  async findByName(name: string): Promise<Role | null> {
    const found = Array.from(this.roles.values()).find((r) => r.name.toUpperCase() === name.toUpperCase());
    return found || null;
  }

  async findById(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  async save(role: Role): Promise<void> {
    this.roles.set(role.id.toString(), role);
  }

  async findAll(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }
}
