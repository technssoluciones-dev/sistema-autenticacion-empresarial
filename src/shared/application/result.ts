/**
 * Los casos de uso devuelven `Result<T, E>` en vez de lanzar excepciones
 * para errores ESPERADOS del negocio (ej: "email ya registrado").
 * Las excepciones (`DomainException`) quedan reservadas para invariantes
 * que jamás deberían romperse si el código está bien escrito.
 *
 * Esto obliga al llamador (el controller) a manejar explícitamente el
 * caso de error — no puede "olvidarse" de un catch.
 */
export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('No se puede leer "value" de un Result fallido. Verificá isSuccess primero.');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('No se puede leer "error" de un Result exitoso. Verificá isFailure primero.');
    }
    return this._error as E;
  }
}
