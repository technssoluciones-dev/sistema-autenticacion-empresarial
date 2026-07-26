import { ValueObject } from '@shared/domain/value-object';
import { DomainException } from '@shared/domain/exceptions/domain.exception';

export class InvalidPermissionNameException extends DomainException {
  constructor(name: string) {
    super(
      `El nombre de permiso '${name}' es inválido. Debe seguir el formato 'modulo:accion' (ej. users:read).`,
    );
  }
}

export class PermissionName extends ValueObject<{ value: string }> {
  private static readonly FORMAT_REGEX = /^[a-z0-9_-]+:[a-z0-9_-]+$/i;

  private constructor(value: string) {
    super({ value });
  }

  public static create(name: string): PermissionName {
    if (!name || !this.FORMAT_REGEX.test(name)) {
      throw new InvalidPermissionNameException(name);
    }
    return new PermissionName(name.toLowerCase().trim());
  }

  get value(): string {
    return this.props.value;
  }
}
