import { AggregateRoot, UniqueEntityId } from '@shared/domain';

export interface RefreshTokenProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

/**
 * Un refresh token es OPACO (una cadena aleatoria, no un JWT firmado):
 * asi puede revocarse al instante consultando la base de datos, algo que
 * un JWT autocontenido no permite sin una tabla de deny-list aparte.
 *
 * Solo se persiste el HASH del token (tokenHash), nunca el valor en
 * texto plano - igual que con las contrasenas. Si la tabla se filtra,
 * los tokens no son directamente reutilizables.
 */
export class RefreshToken extends AggregateRoot<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /**
   * Emite un refresh token nuevo. Recibe el userId, el hash ya calculado
   * (por TokenHasher en infrastructure) y la expiracion ya resuelta.
   */
  static create(props: { userId: string; tokenHash: string; expiresAt: Date }): RefreshToken {
    return new RefreshToken({
      userId: props.userId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    });
  }

  /** Reconstruccion desde persistencia. Sin efectos secundarios. */
  static reconstitute(props: RefreshTokenProps, id: UniqueEntityId): RefreshToken {
    return new RefreshToken(props, id);
  }

  revoke(): void {
    if (this.isRevoked) return; // idempotente: revocar dos veces no es un error
    this.props.revokedAt = new Date();
  }

  get userId(): string {
    return this.props.userId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isRevoked(): boolean {
    return this.props.revokedAt !== null;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  isExpired(): boolean {
    return this.props.expiresAt.getTime() <= Date.now();
  }

  /** Un refresh token solo es utilizable si no fue revocado ni expiro. */
  get isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
