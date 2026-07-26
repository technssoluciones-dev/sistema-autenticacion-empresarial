import { Inject, Injectable } from '@nestjs/common';
import {
  RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/repositories/refresh-token.repository.interface';
import { TokenHasher, TOKEN_HASHER } from '../../domain/services/token-hasher.interface';
import { LogoutRequest } from '../dto/logout.request';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,
  ) {}

  async execute(request: LogoutRequest): Promise<void> {
    const hashedToken = await this.tokenHasher.hash(request.refreshToken);
    await this.refreshTokenRepository.deleteByTokenHash(hashedToken);
  }
}
