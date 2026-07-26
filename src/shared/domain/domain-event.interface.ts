
export interface DomainEvent {
  eventName?: string;
  dateTimeOccurred: Date;
  getAggregateId(): string;
}
