/**
 * Input del use case a nivel de application. NO es el DTO de HTTP
 * (ese vive en `presentation` con sus decoradores de `class-validator`) —
 * este es el contrato interno, agnóstico de transporte. `plainPassword`
 * llega en texto plano acá porque el hashing es responsabilidad del use
 * case (a través del puerto `PasswordHasher`), no de quien lo llama.
 */
export interface RegisterUserRequest {
  email: string;
  plainPassword: string;
  fullName: string;
}
