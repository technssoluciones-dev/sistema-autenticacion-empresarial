
import { ValueObject, InvalidValueObjectException } from '@shared/domain';

export class Email extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  public static create(email: string): Email {
    if (!email || !email.includes('@')) {
      throw new InvalidValueObjectException('Invalid email address');
    }
    return new Email(email.toLowerCase().trim());
  }

  get value(): string {
    return this.props.value;
  }

  public getValue(): string {
    return this.props.value;
  }
}
