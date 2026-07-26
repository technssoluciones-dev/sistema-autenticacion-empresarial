import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog, AuditAction, AuditStatus } from '../../domain/entities/audit-log.entity';
import { AUDIT_REPOSITORY, IAuditRepository } from '../../domain/repositories/audit.repository.interface';

export class AuthEvent {
  constructor(
    public readonly action: AuditAction,
    public readonly status: AuditStatus,
    public readonly userId?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly details?: Record<string, any>,
  ) {}
}

@Injectable()
export class AuditEventListener {
  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
  ) {}

  @OnEvent('security.audit', { async: true })
  async handleSecurityAuditEvent(event: AuthEvent): Promise<void> {
    const auditLog = AuditLog.create({
      action: event.action,
      status: event.status,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: event.details,
    });

    await this.auditRepository.save(auditLog);
  }
}
