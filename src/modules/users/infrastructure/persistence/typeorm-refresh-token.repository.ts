import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';
import { UniqueEntityId } from '@shared/domain/unique-entity-id';

@Injectable()
export class TypeOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repository: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(refreshToken: RefreshToken): Promise<void> {
    const ormEntity = this.repository.create({
      id: refreshToken.id.toString(),
      userId: refreshToken.userId,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt,
      createdAt: refreshToken.createdAt,
    });
    await this.repository.save(ormEntity);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const record = await this.repository.findOne({ where: { tokenHash } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.repository.delete({ tokenHash });
  }

  private toDomain(orm: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.reconstitute(
      {
        userId: orm.userId,
        tokenHash: orm.tokenHash,
        expiresAt: orm.expiresAt,
        revokedAt: orm.revokedAt,
        createdAt: orm.createdAt,
      },
      new UniqueEntityId(orm.id),
    );
  }
}
