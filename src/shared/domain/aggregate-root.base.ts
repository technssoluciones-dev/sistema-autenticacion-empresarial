import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.interface';
import { UniqueEntityId } from './unique-entity-id';

/**
 * Un Aggregate Root es la ENTIDAD DE ENTRADA a un grupo de objetos que
 * deben mantenerse consistentes entre sí (ej: `User` es el aggregate root
 * de sus `RefreshToken`s — no se accede a un RefreshToken sin pasar por su
 * User dueño).
 *
 * Solo los aggregate roots tienen Repository propio. Acumula domain events
 * que la capa de aplicación despacha después de persistir con éxito.
 */
export abstract class AggregateRoot<Props> extends Entity<Props> {
  private _domainEvents: DomainEvent[] = [];

  protected constructor(props: Props, id?: UniqueEntityId) {
    super(props, id);
  }

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
