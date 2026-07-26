import { AuditLog } from '../entities/audit-log.entity';

export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';

export interface IAuditRepository {
  save(auditLog: AuditLog): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<AuditLog[]>;
  findByUserId(userId: string): Promise<AuditLog[]>;
}
