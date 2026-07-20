import { CheckSystemHealthUseCase } from './check-system-health.use-case';
import { DiskHealthIndicator, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

describe('CheckSystemHealthUseCase', () => {
  let useCase: CheckSystemHealthUseCase;
  let health: { check: jest.Mock };

  beforeEach(() => {
    health = {
      check: jest.fn().mockResolvedValue({ status: 'ok', info: {}, error: {}, details: {} }),
    };
    const memory = {} as MemoryHealthIndicator;
    const disk = {} as DiskHealthIndicator;

    useCase = new CheckSystemHealthUseCase(health as unknown as HealthCheckService, memory, disk);
  });

  it('ejecuta los tres indicadores (memoria heap, memoria RSS, disco)', async () => {
    await useCase.execute();

    expect(health.check).toHaveBeenCalledTimes(1);
    const indicators = health.check.mock.calls[0][0];
    expect(indicators).toHaveLength(3);
  });

  it('propaga el resultado del HealthCheckService', async () => {
    const result = await useCase.execute();
    expect(result.status).toBe('ok');
  });
});
