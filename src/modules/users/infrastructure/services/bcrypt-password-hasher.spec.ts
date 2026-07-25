import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  it('produce un hash con el formato de bcrypt ($2b$..., 60 caracteres)', async () => {
    const hash = await hasher.hash('un-password-cualquiera');

    expect(hash).toHaveLength(60);
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('genera hashes distintos para el mismo password (salt aleatorio)', async () => {
    const hashA = await hasher.hash('mismo-password');
    const hashB = await hasher.hash('mismo-password');

    expect(hashA).not.toEqual(hashB);
  });

  it('compare() devuelve true cuando el password en texto plano coincide con el hash', async () => {
    const hash = await hasher.hash('correcto123');

    await expect(hasher.compare('correcto123', hash)).resolves.toBe(true);
  });

  it('compare() devuelve false cuando el password en texto plano no coincide', async () => {
    const hash = await hasher.hash('correcto123');

    await expect(hasher.compare('incorrecto456', hash)).resolves.toBe(false);
  });
});
