/**
 * Output del use case. Deliberadamente NO incluye `password` ni su hash
 * — ni siquiera el hash debería viajar más allá de `application`. Lo
 * arma `UserMapper.toResponse()` a partir de la entidad `User`.
 */
export interface RegisterUserResponse {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}
