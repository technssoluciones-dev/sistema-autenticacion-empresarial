import { RefreshTokenUseCase } from './refresh-token.use-case';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AccessTokenService } from '../../domain/services/access-token.service.interface';
import { RefreshTokenGenerator } from '../../domain/services/refresh-token-generator.interface';
import { TokenHasher } from '../../domain/services/token-hasher.interface';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenGenerator: jest.Mocked<RefreshTokenGenerator>;
  let tokenHasher: jest.Mocked<TokenHasher>;

  beforeEach(() => {
    userRepository = {
      existsByEmail: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };
    refreshTokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
      deleteByTokenHash: jest.fn(),
    };
    accessTokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };
    refreshTokenGenerator = {
      generate: jest.fn(),
    };
    tokenHasher = {
      hash: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      accessTokenService,
      refreshTokenGenerator,
      tokenHasher,
    );
  });

  it('deberï¿½a renovar los tokens exitosamente', async () => {
    const user = User.create({
      email: Email.create('user@example.com'),
      password: Password.createFromHash('hash'),
    });

    const refreshToken = RefreshToken.create({
      userId: user.id.toString(),
      tokenHash: 'hashed_old_token',
      expiresAt: new Date(Date.now() + 100000),
    });

    tokenHasher.hash.mockImplementation(async (token) => `hashed_${token}`);
    refreshTokenRepository.findByTokenHash.mockResolvedValue(refreshToken);
    userRepository.findById.mockResolvedValue(user);
    accessTokenService.generateToken.mockResolvedValue('new_access_token');
    refreshTokenGenerator.generate.mockReturnValue('new_raw_refresh_token');

    const result = await useCase.execute({ refreshToken: 'old_token' });

    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_raw_refresh_token');
    expect(refreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith('hashed_old_token');
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('deberï¿½a lanzar InvalidRefreshTokenException si el token no existe', async () => {
    tokenHasher.hash.mockResolvedValue('hashed_invalid');
    refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'invalid' })).rejects.toThrow(
      InvalidRefreshTokenException,
    );
  });
});
