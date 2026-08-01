import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenService,
  AccessTokenPayload,
} from '../../domain/services/access-token.service.interface';

@Injectable()
export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: AccessTokenPayload): Promise<string> {
    return this.jwtService.signAsync({
      sub: payload.userId,
      email: payload.email,
    });
  }

  async verifyToken(token: string): Promise<AccessTokenPayload> {
    const decoded = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token);
    return {
      userId: decoded.sub,
      email: decoded.email,
    };
  }
}
