import { UniqueEntityId } from '@shared/domain';
import { RefreshToken } from './refresh-token.entity';

describe('RefreshToken (aggregate root)', () => {
  const inOneWeek = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const oneHourAgo = () => new Date(Date.now() - 60 * 60 * 1000);

  it('se emite como válido (no revocado, no expirado)', () => {
    const token = RefreshToken.issue({
      userId: 'user-1',
      tokenHash: 'hash-abc',
      expiresAt: inOneWeek(),
    });

    expect(token.isRevoked).toBe(false);
    expect(token.isExpired).toBe(false);
    expect(token.isValid).toBe(true);
  });

  it('revoke() lo marca como inválido', () => {
    const token = RefreshToken.issue({
      userId: 'user-1',
      tokenHash: 'hash-abc',
      expiresAt: inOneWeek(),
    });

    token.revoke();

    expect(token.isRevoked).toBe(true);
    expect(token.isValid).toBe(false);
  });

  it('revoke() es idempotente: revocar dos veces no lanza error', () => {
    const token = RefreshToken.issue({
      userId: 'user-1',
      tokenHash: 'hash-abc',
      expiresAt: inOneWeek(),
    });

    token.revoke();
    expect(() => token.revoke()).not.toThrow();
    expect(token.isRevoked).toBe(true);
  });

  it('un token con expiresAt en el pasado es inválido aunque no esté revocado', () => {
    const token = RefreshToken.issue({
      userId: 'user-1',
      tokenHash: 'hash-abc',
      expiresAt: oneHourAgo(),
    });

    expect(token.isExpired).toBe(true);
    expect(token.isRevoked).toBe(false);
    expect(token.isValid).toBe(false);
  });

  it('reconstitute no altera el estado de revocación/expiración persistido', () => {
    const token = RefreshToken.reconstitute(
      {
        userId: 'user-1',
        tokenHash: 'hash-abc',
        expiresAt: inOneWeek(),
        revokedAt: oneHourAgo(),
        createdAt: oneHourAgo(),
      },
      UniqueEntityId.create(),
    );

    expect(token.isRevoked).toBe(true);
    expect(token.isValid).toBe(false);
  });
});
