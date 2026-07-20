import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './presentation/controllers/health.controller';
import { CheckSystemHealthUseCase } from './application/check-system-health.use-case';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CheckSystemHealthUseCase],
})
export class HealthModule {}
