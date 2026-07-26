
export const REFRESH_TOKEN_GENERATOR = 'REFRESH_TOKEN_GENERATOR';

export interface RefreshTokenGenerator {
  generate(): string;
}
