import { User } from '../../domain/entities/user.entity';
import { RegisterUserResponse } from '../use-cases/register-user/register-user.response';

/**
 * Traduce la entidad de dominio `User` a DTOs de salida de `application`.
 * Es el único lugar que decide qué campos de la entidad se exponen hacia
 * afuera — evita que cada use case arme el DTO a mano y se olvide de
 * excluir algo sensible (como el hash del password).
 */
export class UserMapper {
  static toResponse(user: User): RegisterUserResponse {
    return {
      id: user.id.toString(),
      email: user.email.value,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }
}
