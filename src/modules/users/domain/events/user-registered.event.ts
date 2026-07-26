
import { DomainEvent } from '@shared/domain';

export class UserRegisteredEvent implements DomainEvent {
  public readonly eventName: string = 'user.registered';
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.userId;
  }
}
