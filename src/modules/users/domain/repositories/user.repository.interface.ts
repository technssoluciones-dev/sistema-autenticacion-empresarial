import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

/**
 * Puerto (interfaz) que `domain`/`application` conocen. La implementación
 * concreta (`SequelizeUserRepository`, o el ORM que se elija) vive en
 * `infrastructure` y se inyecta vía token — ver `users.module.ts`:
 *
 *   { provide: USER_REPOSITORY, useClass: SequelizeUserRepository }
 *
 * Así el use case depende de esta interfaz, nunca del ORM concreto
 * (Dependency Inversion — la regla que ya fuerza ESLint).
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  save(user: User): Promise<void>;
}
