import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Modelo de persistencia (TypeORM) para refresh tokens. Separado de la
 * entidad de dominio RefreshToken, igual que UserOrmEntity respecto a User.
 *
 * revokedAt es nullable: null significa "vigente", una fecha significa
 * "revocado en ese momento" - permite auditar cuando se cerro la sesion,
 * no solo si esta cerrada.
 */
@Entity({ name: 'refresh_tokens' })
export class RefreshTokenOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Index({ unique: true })
  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
