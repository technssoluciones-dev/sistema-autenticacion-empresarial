import { AggregateRoot, UniqueEntityId } from '@shared/domain';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';

export interface UserProps {
  email: Email;
  password: Password;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Aggregate root de este dominio. Es la ENTIDAD DE ENTRADA para todo lo
 * relacionado a un usuario — futuros `RefreshToken` (Fase 4) o
 * asignaciones de `Role` (Fase 5) se acceden a través de `User`, no de
 * forma independiente.
 *
 * No conoce NestJS, ORM ni HTTP: se construye y testea con `new`/`create`
 * sin levantar nada.
 */
export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /**
   * Registro de un usuario nuevo. Dispara `UserRegisteredEvent`.
   * `password` debe llegar ya como Value Object (es decir, ya hasheado
   * por infrastructure) — este método no sabe nada de bcrypt.
   */
  static register(props: { email: Email; password: Password; fullName: string }): User {
    const user = new User({
      email: props.email,
      password: props.password,
      fullName: props.fullName,
      isActive: true,
      createdAt: new Date(),
    });

    user.addDomainEvent(new UserRegisteredEvent(user.id.toString(), props.email.value));

    return user;
  }

  /**
   * Reconstrucción desde persistencia. Sin efectos secundarios (no
   * dispara domain events): un usuario que ya existía no "se registra"
   * de nuevo cada vez que se lee de la base de datos.
   */
  static reconstitute(props: UserProps, id: UniqueEntityId): User {
    return new User(props, id);
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
