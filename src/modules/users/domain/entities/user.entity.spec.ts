import { UniqueEntityId } from '@shared/domain';
import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

describe('User (aggregate root)', () => {
  const validHash = '$2b$10$' + 'a'.repeat(53); // 60 chars, formato bcrypt

  it('se registra y acumula UserRegisteredEvent', () => {
    const user = User.register({
      email: Email.create('Test@Example.com'),
      password: Password.fromHash(validHash),
      fullName: 'Ada Lovelace',
    });

    expect(user.email.value).toBe('test@example.com'); // normalizado
    expect(user.isActive).toBe(true);
    expect(user.domainEvents).toHaveLength(1);
    expect(user.domainEvents[0].eventName).toBe('user.registered');
  });

  it('reconstitute no dispara domain events', () => {
    const user = User.reconstitute(
      {
        email: Email.create('a@a.com'),
        password: Password.fromHash(validHash),
        fullName: 'Ada',
        isActive: true,
        createdAt: new Date(),
      },
      UniqueEntityId.create(),
    );

    expect(user.domainEvents).toHaveLength(0);
  });

  it('Email rechaza formato inválido', () => {
    expect(() => Email.create('no-es-un-email')).toThrow();
  });

  it('Password rechaza texto plano (no tiene formato bcrypt)', () => {
    expect(() => Password.fromHash('mi-password-en-texto-plano')).toThrow();
  });
});
