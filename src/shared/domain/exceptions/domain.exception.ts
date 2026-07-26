export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessRuleViolationException extends DomainException {}
export class InvalidValueObjectException extends DomainException {}
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id?: string) {
    super(id ? `${entityName} with id ${id} was not found` : `${entityName} not found`);
  }
}
export class AuthenticationFailedException extends DomainException {}
