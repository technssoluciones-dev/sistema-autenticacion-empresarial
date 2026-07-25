import { UniqueEntityId } from '@shared/domain';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserOrmEntity } from './user.orm-entity';

/**
 * Traduce entre `UserOrmEntity` (infrastructure) y `User` (domain) en
 * ambas direcciones. `toDomain` usa `User.reconstitute()`, no
 * `User.register()` â€” leer un usuario de la base no es "registrarlo" de
 * nuevo, asÃ­ que no debe disparar `UserRegisteredEvent` cada vez que se
 * hace un `findByEmail`.
 */
export class UserPersistenceMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return User.reconstitute(
      {
        email: Email.create(ormEntity.email),
        password: Password.fromHash(ormEntity.passwordHash),
        fullName: ormEntity.fullName,
        isActive: ormEntity.isActive,
        createdAt: ormEntity.createdAt,
      },
      UniqueEntityId.create(ormEntity.id),
    );
  }

  static toPersistence(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = user.id.toString();
    ormEntity.email = user.email.value;
    ormEntity.passwordHash = user.password.hash;
    ormEntity.fullName = user.fullName;
    ormEntity.isActive = user.isActive;
    ormEntity.createdAt = user.createdAt;

    return ormEntity;
  }
}
