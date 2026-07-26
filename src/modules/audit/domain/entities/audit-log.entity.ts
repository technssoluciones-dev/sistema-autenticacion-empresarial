import { AggregateRoot } from '@shared/domain/aggregate-root';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';

export enum AuditAction {
  USER_REGISTERED = 'USER_REGISTERED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  LOGOUT = 'LOGOUT',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface AuditLogProps {
  userId?: string;
  action: AuditAction;
  status: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt?: Date;
}

export class AuditLog extends AggregateRoot<AuditLogProps> {
  private constructor(props: AuditLogProps, id?: UniqueEntityId) {
    super(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  public static create(props: AuditLogProps, id?: UniqueEntityId): AuditLog {
    return new AuditLog(props, id);
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  get action(): AuditAction {
    return this.props.action;
  }

  get status(): AuditStatus {
    return this.props.status;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get details(): Record<string, any> | undefined {
    return this.props.details;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }
}
