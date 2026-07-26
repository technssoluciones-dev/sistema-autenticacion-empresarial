import { AuthenticationFailedException } from '@shared/domain';

/**
 * Se lanza cuando el login falla, ya sea porque el email no existe o
 * porque el password no coincide. Deliberadamente usa el MISMO mensaje
 * para ambos casos (anti-enumeración): si el mensaje fuera distinto
 * ("usuario no existe" vs "password incorrecto"), un atacante podría
 * usar la API para descubrir qué emails están registrados.
 */
export class InvalidCredentialsException extends AuthenticationFailedException {
  constructor() {
    super('Email o contraseña incorrectos');
  }
}
