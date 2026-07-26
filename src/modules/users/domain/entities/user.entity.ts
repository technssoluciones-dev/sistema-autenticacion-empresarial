import { AggregateRoot, UniqueEntityId } from '@shared/domain';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';

export interface UserProps {
  email: Email;
  password: Password;
  fullName?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(
      {
        ...props,
        fullName: props.fullName ?? 'John Doe',
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  public static create(props: UserProps, id?: UniqueEntityId): User {
    return new User(props, id);
  }

  public static register(props: UserProps, id?: UniqueEntityId): User {
    const user = new User(props, id);
    user.addDomainEvent(new UserRegisteredEvent(user.id.toString(), props.email.value));
    return user;
  }

  public static reconstitute(props: UserProps, id: UniqueEntityId): User {
    return new User(props, id);
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get fullName(): string {
    return this.props.fullName ?? 'John Doe';
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }
}
