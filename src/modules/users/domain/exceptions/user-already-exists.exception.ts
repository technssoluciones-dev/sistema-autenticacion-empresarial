import { BusinessRuleViolationException } from '@shared/domain';

/**
 * Se lanza cuando se intenta registrar un usuario con un email que ya
 * existe. Es un `BusinessRuleViolationException`, no un
 * `EntityNotFoundException` (que es lo opuesto) ni un error de validación
 * de formato — el HttpExceptionFilter la debe mapear a 409 Conflict.
 */
export class UserAlreadyExistsException extends BusinessRuleViolationException {
  constructor(email: string) {
    super(`Ya existe un usuario registrado con el email "${email}"`);
  }
}
