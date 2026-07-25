import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/password-hasher.interface';

/**
 * ImplementaciÃ³n concreta del puerto `PasswordHasher` con bcrypt. Vive en
 * `infrastructure` y se inyecta vÃ­a el token `PASSWORD_HASHER` â€” el use
 * case nunca importa `bcrypt` directamente (ver `password-hasher.interface.ts`).
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  // 12 rounds: balance entre costo de cÃ³mputo y resistencia a fuerza
  // bruta razonable para 2026 en hardware de servidor estÃ¡ndar.
  private static readonly SALT_ROUNDS = 12;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, BcryptPasswordHasher.SALT_ROUNDS);
  }

  async compare(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
