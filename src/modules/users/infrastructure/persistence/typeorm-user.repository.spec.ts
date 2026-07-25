import { Repository } from 'typeorm';
import { TypeOrmUserRepository } from './typeorm-user.repository';
import { UserOrmEntity } from './user.orm-entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { User } from '../../domain/entities/user.entity';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let ormRepository: jest.Mocked<Pick<Repository<UserOrmEntity>, 'findOne' | 'count' | 'save'>>;

  const validHash = '$2b$12$' + 'a'.repeat(53); // 60 chars totales

  const ormEntityFixture: UserOrmEntity = Object.assign(new UserOrmEntity(), {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'user@example.com',
    passwordHash: validHash,
    fullName: 'Nombre Apellido',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    ormRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      save: jest.fn(),
    };

    // El constructor recibe el Repository<UserOrmEntity> vÃ­a @InjectRepository;
    // acÃ¡ se lo pasamos directo como mock, sin levantar ninguna conexiÃ³n real.
    repository = new TypeOrmUserRepository(ormRepository as unknown as Repository<UserOrmEntity>);
  });

  describe('findById', () => {
    it('devuelve un User de dominio cuando el ORM entity existe', async () => {
      ormRepository.findOne.mockResolvedValue(ormEntityFixture);

      const user = await repository.findById(ormEntityFixture.id);

      expect(user).toBeInstanceOf(User);
      expect(user?.email.value).toBe('user@example.com');
      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: ormEntityFixture.id } });
    });

    it('devuelve null cuando no existe', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const user = await repository.findById('no-existe');

      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('busca por el valor normalizado del Email value object', async () => {
      ormRepository.findOne.mockResolvedValue(ormEntityFixture);
      const email = Email.create('User@Example.com');

      const user = await repository.findByEmail(email);

      expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
      expect(user).toBeInstanceOf(User);
    });
  });

  describe('existsByEmail', () => {
    it('devuelve true cuando count > 0', async () => {
      ormRepository.count.mockResolvedValue(1);

      await expect(repository.existsByEmail(Email.create('user@example.com'))).resolves.toBe(true);
    });

    it('devuelve false cuando count es 0', async () => {
      ormRepository.count.mockResolvedValue(0);

      await expect(repository.existsByEmail(Email.create('nadie@example.com'))).resolves.toBe(
        false,
      );
    });
  });

  describe('save', () => {
    it('mapea el User de dominio a UserOrmEntity antes de persistir', async () => {
      const user = User.register({
        email: Email.create('nuevo@example.com'),
        password: Password.fromHash(validHash),
        fullName: 'Nuevo Usuario',
      });

      await repository.save(user);

      expect(ormRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id.toString(),
          email: 'nuevo@example.com',
          passwordHash: validHash,
          fullName: 'Nuevo Usuario',
          isActive: true,
        }),
      );
    });
  });
});
