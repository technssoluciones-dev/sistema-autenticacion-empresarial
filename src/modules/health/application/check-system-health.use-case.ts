import { Injectable } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { UseCase } from '@shared/application';

/**
 * Orquesta los indicadores de salud (memoria, disco, y desde la Fase 3
 * también la conexión a PostgreSQL). El controller solo llama `execute()`;
 * no sabe qué se está chequeando ni con qué umbrales.
 */
@Injectable()
export class CheckSystemHealthUseCase implements UseCase<void, HealthCheckResult> {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  execute(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }
}
