import { HealthController } from './health.controller';
import { HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    const health = {
      check: jest.fn().mockResolvedValue({ status: 'ok' }),
    } as unknown as HealthCheckService;
    const memory = {} as MemoryHealthIndicator;
    const disk = {} as DiskHealthIndicator;

    controller = new HealthController(health, memory, disk);
  });

  it('liveness responde con status ok', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('check delega en HealthCheckService.check', async () => {
    const result = await controller.check();
    expect(result).toEqual({ status: 'ok' });
  });
});
