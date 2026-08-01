import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenGenerator } from '../../domain/services/refresh-token-generator.interface';

@Injectable()
export class UuidRefreshTokenGenerator implements RefreshTokenGenerator {
  generate(): string {
    return uuidv4();
  }
}
