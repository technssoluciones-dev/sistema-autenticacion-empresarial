/**
 * Puerto para hashear el refresh token antes de guardarlo. Es un puerto
 * DISTINTO de `PasswordHasher` (módulo users) a propósito: bcrypt está
 * diseñado para ser LENTO (protege contra fuerza bruta offline de
 * contraseñas cortas elegidas por humanos). Un refresh token ya es una
 * cadena aleatoria de alta entropía (256 bits) — no necesita ese costo
 * computacional, y en el flujo de refresh se hashea en CADA request. Un
 * hash rápido y determinístico (SHA-256) es correcto acá: la
 * implementación concreta vive en `infrastructure/services`.
 */
export const TOKEN_HASHER = Symbol('TOKEN_HASHER');

export interface TokenHasher {
  hash(token: string): string;
}
