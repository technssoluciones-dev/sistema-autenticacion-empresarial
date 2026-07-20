/**
 * Un Domain Event representa algo relevante que ya ocurrió en el negocio
 * (`UserRegisteredEvent`, `PasswordChangedEvent`, `LoginFailedEvent`...).
 * Se usan en la Fase 8 (Auditoría) para registrar trazabilidad sin acoplar
 * el caso de uso que los dispara con quien los consume (logger, tabla de
 * auditoría, notificaciones por email, etc.).
 */
export interface DomainEvent {
  readonly occurredAt: Date;
  readonly eventName: string;
}
