import { Inject, Injectable } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository.interface';
import { PasswordHasher, PASSWORD_HASHER } from '../../domain/services/password-hasher.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import {
  RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '../../domain/repositories/refresh-token.repository.interface';
import {
  AccessTokenService,
  ACCESS_TOKEN_SERVICE,
} from '../../domain/services/access-token.service.interface';
import {
  RefreshTokenGenerator,
  REFRESH_TOKEN_GENERATOR,
} from '../../domain/services/refresh-token-generator.interface';
import { TokenHasher, TOKEN_HASHER } from '../../domain/services/token-hasher.interface';
import { LoginRequest } from '../dto/login.request';
import { LoginResponse } from '../dto/login.response';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(ACCESS_TOKEN_SERVICE)
    private readonly accessTokenService: AccessTokenService,
    @Inject(REFRESH_TOKEN_GENERATOR)
    private readonly refreshTokenGenerator: RefreshTokenGenerator,
    @Inject(TOKEN_HASHER)
    private readonly tokenHasher: TokenHasher,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const email = Email.create(request.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      request.password,
      user.password.value,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const accessToken = await this.accessTokenService.generateToken({
      userId: user.id.toString(),
      email: user.email.value,
    });

    const rawRefreshToken = this.refreshTokenGenerator.generate();
    const hashedRefreshToken = await this.tokenHasher.hash(rawRefreshToken);

    const refreshTokenEntity = RefreshToken.create({
      userId: user.id.toString(),
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return new LoginResponse(accessToken, rawRefreshToken);
  }
}
