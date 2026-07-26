import { RefreshToken } from '../entities/refresh-token.entity';

/**
 * Puerto (interfaz) para persistir refresh tokens. Misma convención que
 * `UserRepository`: `domain`/`application` conocen esta interfaz, la
 * implementación con TypeORM vive en `infrastructure` y se inyecta vía
 * el token `REFRESH_TOKEN_REPOSITORY` — ver `auth.module.ts`.
 */
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface RefreshTokenRepository {
  /** Busca por el HASH del token (nunca se busca por el valor en texto plano). */
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  save(refreshToken: RefreshToken): Promise<void>;
  /** Usado en logout "de todos los dispositivos" (fuera del alcance de esta fase, pero el puerto ya lo contempla). */
  revokeAllForUser(userId: string): Promise<void>;
}
