import { LogoutUseCase } from './logout.use-case';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { TokenHasher } from '../../domain/services/token-hasher.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let tokenHasher: jest.Mocked<TokenHasher>;

  beforeEach(() => {
    refreshTokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
      deleteByTokenHash: jest.fn(),
    };
    tokenHasher = {
      hash: jest.fn(),
    };

    useCase = new LogoutUseCase(refreshTokenRepository, tokenHasher);
  });

  it('debería eliminar el refresh token correctamente al cerrar sesión', async () => {
    tokenHasher.hash.mockResolvedValue('hashed_token');

    await useCase.execute({ refreshToken: 'raw_token' });

    expect(tokenHasher.hash).toHaveBeenCalledWith('raw_token');
    expect(refreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith('hashed_token');
  });
});
