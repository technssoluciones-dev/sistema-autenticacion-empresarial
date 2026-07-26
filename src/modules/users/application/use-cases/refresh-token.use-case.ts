
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';
import { RefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '../../domain/repositories/refresh-token.repository.interface';
import { AccessTokenService, ACCESS_TOKEN_SERVICE } from '../../domain/services/access-token.service.interface';
import { RefreshTokenGenerator, REFRESH_TOKEN_GENERATOR } from '../../domain/services/refresh-token-generator.interface';
import { TokenHasher, TOKEN_HASHER } from '../../domain/services/token-hasher.interface';
import { RefreshTokenRequest } from '../dto/refresh-token.request';
import { RefreshTokenResponse } from '../dto/refresh-token.response';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(ACCESS_TOKEN_SERVICE)
    private readonly accessTokenService: AccessTokenService,
    @Inject(REFRESH_TOKEN_GENERATOR)
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const hashedToken = await this.tokenHasher.hash(request.refreshToken);
    const existingRefreshToken = await this.refreshTokenRepository.findByTokenHash(hashedToken);

    if (!existingRefreshToken || existingRefreshToken.isExpired()) {
      throw new InvalidRefreshTokenException();
    }

    const user = await this.userRepository.findById(existingRefreshToken.userId);
    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    await this.refreshTokenRepository.deleteByTokenHash(hashedToken);

    const accessToken = await this.accessTokenService.generateToken({
      userId: user.id.toString(),
      email: user.email.value,
    });

    const newRawRefreshToken = this.refreshTokenGenerator.generate();
    const newHashedRefreshToken = await this.tokenHasher.hash(newRawRefreshToken);

    const newRefreshTokenEntity = RefreshToken.create({
      userId: user.id.toString(),
      tokenHash: newHashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    return new RefreshTokenResponse(accessToken, newRawRefreshToken);
  }
}
