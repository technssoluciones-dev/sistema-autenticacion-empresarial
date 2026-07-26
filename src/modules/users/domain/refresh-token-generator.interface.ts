/**
 * Puerto para generar el valor en texto plano de un refresh token nuevo
 * (una cadena aleatoria opaca, no un JWT). La implementación
 * (`CryptoRefreshTokenGenerator`, en infrastructure) usa el módulo
 * `crypto` nativo de Node — no hace falta ninguna librería externa para
 * esto, así que no se agrega una dependencia solo por el puerto.
 *
 * `ttlMs()` vive acá y no como una constante en `application` a
 * propósito: convertir strings de configuración como '7d' a
 * milisegundos es un detalle de infraestructura (lee `JwtConfig` /
 * `ConfigService`), no una regla de negocio — `application` solo
 * necesita "cuánto dura", no "cómo se parsea".
 */
export const REFRESH_TOKEN_GENERATOR = Symbol('REFRESH_TOKEN_GENERATOR');

export interface RefreshTokenGenerator {
  generate(): string;
  ttlMs(): number;
}
