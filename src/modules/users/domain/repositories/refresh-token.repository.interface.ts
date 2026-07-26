
import { RefreshToken } from '../entities/refresh-token.entity';

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

export interface RefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
