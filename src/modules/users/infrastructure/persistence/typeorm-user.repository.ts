import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from './user.orm-entity';
import { UserPersistenceMapper } from './user.persistence.mapper';

/**
 * ImplementaciÃ³n concreta del puerto `UserRepository` con TypeORM. Vive
 * en `infrastructure` y se inyecta en `application` a travÃ©s del token
 * `USER_REPOSITORY` (ver `users.module.ts`) â€” el use case nunca importa
 * esta clase ni `typeorm` directamente.
 */
@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { id } });
    return ormEntity ? UserPersistenceMapper.toDomain(ormEntity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const ormEntity = await this.ormRepository.findOne({ where: { email: email.value } });
    return ormEntity ? UserPersistenceMapper.toDomain(ormEntity) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.ormRepository.count({ where: { email: email.value } });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const ormEntity = UserPersistenceMapper.toPersistence(user);
    await this.ormRepository.save(ormEntity);
  }
}
