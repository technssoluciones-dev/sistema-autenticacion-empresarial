import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogOrmEntity } from './infrastructure/persistence/audit-log.orm-entity';
import { TypeOrmAuditRepository } from './infrastructure/persistence/typeorm-audit.repository';
import { AUDIT_REPOSITORY } from './domain/repositories/audit.repository.interface';
import { AuditEventListener } from './application/listeners/audit-event.listener';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogOrmEntity])],
  providers: [
    AuditEventListener,
    {
      provide: AUDIT_REPOSITORY,
      useClass: TypeOrmAuditRepository,
    },
  ],
  exports: [AUDIT_REPOSITORY],
})
export class AuditModule {}
