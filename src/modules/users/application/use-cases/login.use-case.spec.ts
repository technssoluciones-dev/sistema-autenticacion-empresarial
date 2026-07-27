import { LoginUseCase } from './login.use-case';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../../domain/services/password-hasher.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { AccessTokenService } from '../../domain/services/access-token.service.interface';
import { RefreshTokenGenerator } from '../../domain/services/refresh-token-generator.interface';
import { TokenHasher } from '../../domain/services/token-hasher.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let refreshTokenGenerator: jest.Mocked<RefreshTokenGenerator>;
  let tokenHasher: jest.Mocked<TokenHasher>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    userRepository = {
      existsByEmail: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
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
    refreshTokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
      deleteByTokenHash: jest.fn(),
    };

    useCase = new LoginUseCase(
      userRepository,
      passwordHasher,
      accessTokenService,
      refreshTokenGenerator,
      tokenHasher,
      refreshTokenRepository,
    );
  });

  it('deberia autenticar correctamente y retornar tokens', async () => {
    const emailStr = 'test@example.com';
    const rawPassword = 'password123';
    const hashedPass = 'hashedPassword';
    const user = User.create({
      email: Email.create(emailStr),
      password: Password.createFromHash(hashedPass),
    });

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.compare.mockResolvedValue(true);
    accessTokenService.generateToken.mockResolvedValue('access_token_123');
    refreshTokenGenerator.generate.mockReturnValue('raw_refresh_token');
    tokenHasher.hash.mockResolvedValue('hashed_refresh_token');

    const result = await useCase.execute({
      email: emailStr,
      password: rawPassword,
    });

    expect(result.accessToken).toBe('access_token_123');
    expect(result.refreshToken).toBe('raw_refresh_token');
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('deberia lanzar InvalidCredentialsException si el usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'noexist@example.com', password: 'pass' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
