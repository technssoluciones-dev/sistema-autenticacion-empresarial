import { ValueObject, InvalidValueObjectException } from '@shared/domain';

interface EmailProps {
  value: string;
}

/**
 * Value Object: encapsula la única regla de negocio real de un email en
 * este dominio (formato válido) y lo normaliza (lowercase, sin espacios)
 * para que dos escrituras del mismo email siempre resulten en el mismo
 * Value Object — evita duplicados como "a@a.com" vs "A@A.com ".
 */
export class Email extends ValueObject<EmailProps> {
  // Regla simple e intencional: la validación exhaustiva de RFC 5322 no es
  // responsabilidad del dominio. Se valida formato razonable; la prueba
  // real de que el email existe pasa por el flujo de verificación (Fase 3+).
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  static create(rawEmail: string): Email {
    const normalized = rawEmail.trim().toLowerCase();

    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new InvalidValueObjectException(`"${rawEmail}" no es un email válido`);
    }

    return new Email({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
