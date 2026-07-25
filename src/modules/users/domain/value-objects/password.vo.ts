import { ValueObject, InvalidValueObjectException } from '@shared/domain';

interface PasswordProps {
  hash: string;
}

/**
 * Value Object: representa un password YA HASHEADO.
 *
 * Decisión de diseño deliberada: este Value Object nunca recibe ni
 * almacena texto plano. El hashing (bcrypt) es un detalle de
 * infraestructura y no debe filtrarse al dominio — por eso la validación
 * de "fuerza mínima" del password en texto plano ocurre ANTES, en la capa
 * de application (o en el DTO de presentation), no acá.
 *
 * `Password.fromHash()` es el único constructor: se usa al reconstruir un
 * User desde persistencia o después de que `infrastructure` hasheó el
 * texto plano que llegó del use case.
 */
export class Password extends ValueObject<PasswordProps> {
  // bcrypt siempre produce hashes de 60 caracteres con el formato $2b$...
  private static readonly BCRYPT_HASH_LENGTH = 60;

  private constructor(props: PasswordProps) {
    super(props);
  }

  static fromHash(hash: string): Password {
    if (!hash || hash.length !== Password.BCRYPT_HASH_LENGTH) {
      throw new InvalidValueObjectException(
        'El hash de password no tiene el formato esperado (¿se intentó pasar texto plano?)',
      );
    }

    return new Password({ hash });
  }

  get hash(): string {
    return this.props.hash;
  }
}
