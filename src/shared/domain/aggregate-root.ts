
import { UniqueEntityId } from './unique-entity-id';
import { DomainEvent } from './domain-event.interface';

export abstract class AggregateRoot<T> {
  protected readonly _id: UniqueEntityId;
  protected props: T;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: T, id?: UniqueEntityId) {
    this._id = id ? id : new UniqueEntityId();
    this.props = props;
  }

  get id(): UniqueEntityId {
    return this._id;
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
