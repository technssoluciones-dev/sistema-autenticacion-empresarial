/**
 * Excepción base del dominio. Deliberadamente NO extiende de
 * `HttpException` de NestJS: el dominio no sabe que existe HTTP.
 *
 * La capa de `presentation` (un ExceptionFilter, Fase 6) es la responsable
 * de traducir `DomainException` -> código de estado HTTP correcto. Así el
 * mismo caso de uso podría exponerse algún día por gRPC o un worker de
 * colas sin reescribir una sola línea de dominio.
 */
export abstract class DomainException extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** El recurso solicitado no existe (ej: usuario, rol). */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} con identificador "${identifier}" no fue encontrado`);
  }
}

/** El estado actual del sistema no permite la operación solicitada. */
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/** Los datos de entrada violan una invariante del dominio (no de formato HTTP). */
export class InvalidValueObjectException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
