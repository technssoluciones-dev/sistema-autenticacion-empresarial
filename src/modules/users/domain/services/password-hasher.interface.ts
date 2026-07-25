/**
 * Puerto (interfaz) para hashear y comparar passwords. `domain` y
 * `application` conocen esta interfaz; la implementación concreta con
 * bcrypt vive en `infrastructure` (`BcryptPasswordHasher`) y se inyecta
 * vía token — mismo patrón que `UserRepository`.
 *
 * Así el use case nunca importa `bcrypt` directamente: es testeable con
 * un mock simple, y el algoritmo de hashing se puede cambiar sin tocar
 * una sola línea de `domain` ni `application`.
 */
export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}
