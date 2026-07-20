import { randomUUID } from 'crypto';

/**
 * Envuelve un identificador (UUID v4) en un tipo propio en vez de pasar
 * strings sueltos por todo el dominio. Esto evita errores como pasar un
 * `email` donde se esperaba un `userId` — el compilador lo detecta.
 */
export class UniqueEntityId {
  private readonly value: string;

  private constructor(id?: string) {
    this.value = id ?? randomUUID();
  }

  static create(id?: string): UniqueEntityId {
    return new UniqueEntityId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other?: UniqueEntityId): boolean {
    if (other === null || other === undefined) return false;
    return this.value === other.value;
  }
}
