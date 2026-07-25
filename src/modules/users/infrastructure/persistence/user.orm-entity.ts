import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Modelo de persistencia (TypeORM). Deliberadamente separado de la
 * entidad de dominio `User` â€” esta clase solo describe la tabla, no
 * tiene comportamiento de negocio. `UserPersistenceMapper` traduce entre
 * ambas en las dos direcciones.
 *
 * `id` es `uuid` con valor asignado por dominio (no `@PrimaryGeneratedColumn`
 * autoincremental ni `uuid` generado por la base): el aggregate `User` ya
 * crea su propio `UniqueEntityId` al construirse, y este modelo solo lo
 * persiste tal cual llega.
 */
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
