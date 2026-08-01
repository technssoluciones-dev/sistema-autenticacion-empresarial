import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AuditAction, AuditStatus, AuditDetails } from '../../domain/entities/audit-log.entity';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  userId?: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'enum', enum: AuditStatus })
  status!: AuditStatus;

  @Column({ type: 'varchar', nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', nullable: true })
  details?: AuditDetails;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
