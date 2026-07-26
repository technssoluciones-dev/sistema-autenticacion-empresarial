import { v4 as uuidv4 } from 'uuid';

export class UniqueEntityId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id || uuidv4();
  }

  public static create(id?: string): UniqueEntityId {
    return new UniqueEntityId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(id?: UniqueEntityId): boolean {
    if (id === null || id === undefined) return false;
    if (!(id instanceof UniqueEntityId)) return false;
    return id.toString() === this.value;
  }
}
