import { Repository } from 'typeorm';
import { TypeOrmAuditRepository } from './typeorm-audit.repository';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
import { AuditLog, AuditAction, AuditStatus } from '../../domain/entities/audit-log.entity';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';

describe('TypeOrmAuditRepository', () => {
  let repository: TypeOrmAuditRepository;
  let ormRepository: jest.Mocked<Pick<Repository<AuditLogOrmEntity>, 'create' | 'save' | 'find'>>;

  const ormEntityFixture: AuditLogOrmEntity = Object.assign(new AuditLogOrmEntity(), {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-123',
    action: AuditAction.LOGIN_SUCCESS,
    status: AuditStatus.SUCCESS,
    ipAddress: '127.0.0.1',
    userAgent: 'jest-test-agent',
    details: { foo: 'bar' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    ormRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    repository = new TypeOrmAuditRepository(
      ormRepository as unknown as Repository<AuditLogOrmEntity>,
    );
  });

  describe('save', () => {
    it('mapea el AuditLog de dominio a AuditLogOrmEntity antes de persistir', async () => {
      const auditLog = AuditLog.create(
        {
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          userId: 'user-123',
          ipAddress: '127.0.0.1',
          userAgent: 'jest-test-agent',
          details: { foo: 'bar' },
        },
        new UniqueEntityId('11111111-1111-1111-1111-111111111111'),
      );

      ormRepository.create.mockReturnValue(ormEntityFixture);

      await repository.save(auditLog);

      expect(ormRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '11111111-1111-1111-1111-111111111111',
          userId: 'user-123',
          action: AuditAction.LOGIN_SUCCESS,
          status: AuditStatus.SUCCESS,
          ipAddress: '127.0.0.1',
          userAgent: 'jest-test-agent',
          details: { foo: 'bar' },
        }),
      );
      expect(ormRepository.save).toHaveBeenCalledWith(ormEntityFixture);
    });
  });

  describe('findAll', () => {
    it('devuelve una lista de AuditLog mapeados desde los registros ORM', async () => {
      ormRepository.find.mockResolvedValue([ormEntityFixture]);

      const result = await repository.findAll();

      expect(ormRepository.find).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AuditLog);
      expect(result[0].userId).toBe('user-123');
    });

    it('respeta limit y offset personalizados', async () => {
      ormRepository.find.mockResolvedValue([]);

      await repository.findAll(10, 20);

      expect(ormRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 20,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByUserId', () => {
    it('filtra los registros por userId', async () => {
      ormRepository.find.mockResolvedValue([ormEntityFixture]);

      const result = await repository.findByUserId('user-123');

      expect(ormRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AuditLog);
    });

    it('devuelve un array vacio cuando no hay coincidencias', async () => {
      ormRepository.find.mockResolvedValue([]);

      const result = await repository.findByUserId('sin-registros');

      expect(result).toEqual([]);
    });
  });
});
