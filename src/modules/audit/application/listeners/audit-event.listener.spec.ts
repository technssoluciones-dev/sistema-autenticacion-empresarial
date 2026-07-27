import { AuditEventListener, AuthEvent } from './audit-event.listener';
import { AuditAction, AuditStatus } from '../../domain/entities/audit-log.entity';
import { IAuditRepository } from '../../domain/repositories/audit.repository.interface';

describe('AuditEventListener', () => {
  let listener: AuditEventListener;
  let repository: jest.Mocked<IAuditRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
    };
    listener = new AuditEventListener(repository);
  });

  it('debe procesar y guardar un evento de auditoria de seguridad', async () => {
    const event = new AuthEvent(
      AuditAction.LOGIN_SUCCESS,
      AuditStatus.SUCCESS,
      'user-123',
      '127.0.0.1',
      'Mozilla/5.0',
      { email: 'test@example.com' },
    );

    await listener.handleSecurityAuditEvent(event);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        action: AuditAction.LOGIN_SUCCESS,
        status: AuditStatus.SUCCESS,
        ipAddress: '127.0.0.1',
      }),
    );
  });
});
