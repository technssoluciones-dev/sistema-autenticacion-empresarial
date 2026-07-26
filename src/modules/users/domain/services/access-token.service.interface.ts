export const ACCESS_TOKEN_SERVICE = 'ACCESS_TOKEN_SERVICE';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface AccessTokenService {
  generateToken(payload: AccessTokenPayload): Promise<string>;
  verifyToken?(token: string): Promise<AccessTokenPayload>;
}
