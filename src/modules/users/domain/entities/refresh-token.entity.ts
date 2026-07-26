
import { AggregateRoot, UniqueEntityId } from '@shared/domain';

export interface RefreshTokenProps {
  userId: string | UniqueEntityId;
  tokenHash: string;
  expiresAt: Date;
  isRevoked?: boolean;
}

export class RefreshToken extends AggregateRoot<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: UniqueEntityId) {
    super(
      {
        ...props,
        isRevoked: props.isRevoked ?? false,
      },
      id,
    );
  }

  public static create(props: RefreshTokenProps, id?: UniqueEntityId): RefreshToken {
    return new RefreshToken(props, id);
  }

  get userId(): string {
    return typeof this.props.userId === 'string' 
      ? this.props.userId 
      : this.props.userId.toString();
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked ?? false;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
