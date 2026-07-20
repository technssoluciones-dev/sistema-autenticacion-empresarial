import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { CheckSystemHealthUseCase } from '../../application/check-system-health.use-case';

/**
 * Adaptador HTTP puro: traduce la petición a una llamada de caso de uso
 * y el resultado a una respuesta. Sin lógica de negocio acá — si mañana
 * este mismo chequeo se expone por gRPC, el caso de uso no cambia, solo
 * se escribe un adaptador nuevo en `presentation`.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly checkSystemHealthUseCase: CheckSystemHealthUseCase) {}

  @Get()
  @HealthCheck()
  check() {
    return this.checkSystemHealthUseCase.execute();
  }

  @Get('liveness')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
