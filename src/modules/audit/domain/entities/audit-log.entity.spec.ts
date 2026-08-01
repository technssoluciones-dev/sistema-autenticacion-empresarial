import { AuditLog, AuditAction, AuditStatus } from './audit-log.entity';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';

describe('AuditLog', () => {
  describe('create', () => {
    it('crea un AuditLog con las props dadas', () => {
      const auditLog = AuditLog.create({
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        userId: 'user-123',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test-agent',
        details: { foo: 'bar' },
      });

      expect(auditLog.action).toBe(AuditAction.LOGIN_SUCCESS);
      expect(auditLog.status).toBe(AuditStatus.SUCCESS);
      expect(auditLog.userId).toBe('user-123');
      expect(auditLog.ipAddress).toBe('127.0.0.1');
      expect(auditLog.userAgent).toBe('jest-test-agent');
      expect(auditLog.details).toEqual({ foo: 'bar' });
    });

    it('autogenera createdAt cuando no se provee', () => {
      const before = new Date();
      const auditLog = AuditLog.create({
        action: AuditAction.LOGIN_FAILED,
        status: AuditStatus.FAILURE,
      });
      const after = new Date();

      expect(auditLog.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(auditLog.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('respeta un createdAt explicito', () => {
      const fixedDate = new Date('2026-01-01T00:00:00.000Z');
      const auditLog = AuditLog.create({
        action: AuditAction.LOGOUT,
        status: AuditStatus.SUCCESS,
        createdAt: fixedDate,
      });

      expect(auditLog.createdAt).toEqual(fixedDate);
    });

    it('permite pasar un id explicito', () => {
      const id = new UniqueEntityId('11111111-1111-1111-1111-111111111111');
      const auditLog = AuditLog.create(
        {
          action: AuditAction.ROLE_ASSIGNED,
          status: AuditStatus.SUCCESS,
        },
        id,
      );

      expect(auditLog.id.toString()).toBe('11111111-1111-1111-1111-111111111111');
    });

    it('deja userId, ipAddress, userAgent y details como undefined si no se pasan', () => {
      const auditLog = AuditLog.create({
        action: AuditAction.TOKEN_REFRESHED,
        status: AuditStatus.SUCCESS,
      });

      expect(auditLog.userId).toBeUndefined();
      expect(auditLog.ipAddress).toBeUndefined();
      expect(auditLog.userAgent).toBeUndefined();
      expect(auditLog.details).toBeUndefined();
    });
  });
});
