export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
}

export interface SignedAccessToken {
  token: string;
  expiresInSeconds: number;
}

/**
 * Puerto para firmar el JWT de access token. `domain`/`application` no
 * conocen `@nestjs/jwt` directamente — la implementación
 * (`JwtAccessTokenService`) vive en `infrastructure` e inyecta el
 * `JwtService` de Nest por debajo. Esto es lo que hace testeable
 * `LoginUseCase` sin firmar un JWT real en cada test.
 */
export const ACCESS_TOKEN_SERVICE = Symbol('ACCESS_TOKEN_SERVICE');

export interface AccessTokenService {
  sign(payload: AccessTokenPayload): SignedAccessToken;
}
