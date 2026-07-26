import { AuthenticationFailedException } from '@shared/domain';

/**
 * Se lanza cuando el refresh token enviado no existe, ya expiró, o ya fue
 * revocado (por logout o por una rotación anterior). Un único mensaje
 * genérico para los tres casos — al cliente le da igual la causa exacta,
 * la acción correcta siempre es la misma: volver a hacer login.
 */
export class InvalidRefreshTokenException extends AuthenticationFailedException {
  constructor() {
    super('El refresh token es inválido, expiró o ya fue revocado');
  }
}
