import { HealthController } from './health.controller';
import { CheckSystemHealthUseCase } from '../../application/check-system-health.use-case';

describe('HealthController', () => {
  let controller: HealthController;
  let useCase: { execute: jest.Mock };

  beforeEach(() => {
    useCase = { execute: jest.fn().mockResolvedValue({ status: 'ok' }) };
    controller = new HealthController(useCase as unknown as CheckSystemHealthUseCase);
  });

  it('liveness responde con status ok', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('check delega en CheckSystemHealthUseCase.execute', async () => {
    const result = await controller.check();
    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok' });
  });
});
