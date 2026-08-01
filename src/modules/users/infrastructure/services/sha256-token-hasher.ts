import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { TokenHasher } from '../../domain/services/token-hasher.interface';

@Injectable()
export class Sha256TokenHasher implements TokenHasher {
  async hash(token: string): Promise<string> {
    return createHash('sha256').update(token).digest('hex');
  }
}
