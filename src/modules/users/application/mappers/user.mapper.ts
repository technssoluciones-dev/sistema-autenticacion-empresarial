import { User } from '../../domain/entities/user.entity';

export class UserMapper {
  static toResponse(user: User) {
    return {
      id: user.id.toString(),
      email: user.email.value,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
