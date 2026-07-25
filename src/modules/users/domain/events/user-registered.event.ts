import { DomainEvent } from '@shared/domain';

/**
 * Se acumula en el aggregate `User` cuando se registra un usuario nuevo.
 * La capa de application lo despacha después de persistir con éxito
 * (Fase 8 - Auditoría lo consume; por ahora solo se acumula y se limpia).
 */
export class UserRegisteredEvent implements DomainEvent {
  readonly occurredAt: Date;
  readonly eventName = 'user.registered';

  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    this.occurredAt = new Date();
  }
}
