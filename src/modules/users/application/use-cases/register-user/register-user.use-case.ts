import { Inject, Injectable } from '@nestjs/common';
import { UseCase, Result } from '@shared/application';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import {
  PasswordHasher,
  PASSWORD_HASHER,
} from '../../../domain/services/password-hasher.interface';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { UserMapper } from '../../mappers/user.mapper';
import { RegisterUserRequest } from './register-user.request';
import { RegisterUserResponse } from './register-user.response';

/**
 * Registra un usuario nuevo.
 *
 * Decisión sobre manejo de errores (resuelve la tensión entre los dos
 * patrones que ya existían en el proyecto):
 *
 * - "Email ya registrado" es un Result.fail(), NO un throw. Es el
 *   ejemplo textual que usa `result.ts` para justificar por qué existe
 *   `Result`: es un desenlace de negocio esperado incluso con input
 *   100% válido (depende del estado de la base, no del request), y el
 *   controller debe manejarlo explícitamente.
 * - El *contenido* del `Result.fail()` sigue siendo una `DomainException`
 *   real (`UserAlreadyExistsException`) — no un string ni un enum suelto.
 *   Así el controller puede simplemente `throw result.error` y dejar que
 *   el `HttpExceptionFilter` (ya actualizado) lo traduzca a 409. Se
 *   reusa la jerarquía de excepciones sin reusar el mecanismo de "throw".
 * - Formato de email inválido, en cambio, SÍ se deja como `throw` sin
 *   capturar acá: se espera que el DTO de `presentation` (class-validator,
 *   `@IsEmail`) ya lo haya rechazado antes de llegar a este use case. Si
 *   `Email.create()` igual lanza `InvalidValueObjectException`, es
 *   porque algo se saltó esa validación — una invariante rota de verdad,
 *   no un desenlace de negocio esperado. El filtro igual lo traduce a
 *   400, pero por la vía de excepción no capturada.
 */
@Injectable()
export class RegisterUserUseCase implements UseCase<
  RegisterUserRequest,
  Result<RegisterUserResponse, UserAlreadyExistsException>
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    request: RegisterUserRequest,
  ): Promise<Result<RegisterUserResponse, UserAlreadyExistsException>> {
    const email = Email.create(request.email);

    const alreadyExists = await this.userRepository.existsByEmail(email);
    if (alreadyExists) {
      return Result.fail(new UserAlreadyExistsException(email.value));
    }

    const passwordHash = await this.passwordHasher.hash(request.plainPassword);
    const password = Password.fromHash(passwordHash);

    const user = User.register({ email, password, fullName: request.fullName });

    await this.userRepository.save(user);

    // Fase 8 (Auditoría) despachará estos eventos a un event bus real.
    // Por ahora se acumulan y se limpian para no dejarlos "colgados" en
    // la instancia si algo más la reutiliza dentro del mismo request.
    user.clearDomainEvents();

    return Result.ok(UserMapper.toResponse(user));
  }
}
