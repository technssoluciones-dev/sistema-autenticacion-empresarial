import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuditRepository } from '../../domain/repositories/audit.repository.interface';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogOrmEntity } from './audit-log.orm-entity';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';

@Injectable()
export class TypeOrmAuditRepository implements IAuditRepository {
  constructor(
    @InjectRepository(AuditLogOrmEntity)
    private readonly repository: Repository<AuditLogOrmEntity>,
  ) {}

  async save(auditLog: AuditLog): Promise<void> {
    const ormEntity = this.repository.create({
      id: auditLog.id.toString(),
      userId: auditLog.userId,
      action: auditLog.action,
      status: auditLog.status,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      details: auditLog.details,
      createdAt: auditLog.createdAt,
    });
    await this.repository.save(ormEntity);
  }

  async findAll(limit = 50, offset = 0): Promise<AuditLog[]> {
    const records = await this.repository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    return records.map(r => this.toDomain(r));
  }

  async findByUserId(userId: string): Promise<AuditLog[]> {
    const records = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return records.map(r => this.toDomain(r));
  }

  private toDomain(orm: AuditLogOrmEntity): AuditLog {
    return AuditLog.create(
      {
        userId: orm.userId,
        action: orm.action,
        status: orm.status,
        ipAddress: orm.ipAddress,
        userAgent: orm.userAgent,
        details: orm.details,
        createdAt: orm.createdAt,
      },
      new UniqueEntityId(orm.id),
    );
  }
}
