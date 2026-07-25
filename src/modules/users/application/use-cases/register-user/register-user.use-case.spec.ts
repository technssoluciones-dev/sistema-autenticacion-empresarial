import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { PasswordHasher } from '../../../domain/services/password-hasher.interface';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;

  const validHash = '$2b$10$' + 'a'.repeat(53); // 60 chars, formato bcrypt

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(undefined),
    };

    passwordHasher = {
      hash: jest.fn().mockResolvedValue(validHash),
      compare: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('registra un usuario y devuelve Result.ok con el DTO de respuesta', async () => {
    const result = await useCase.execute({
      email: 'Ada@Example.com',
      plainPassword: 'un-password-seguro',
      fullName: 'Ada Lovelace',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.email).toBe('ada@example.com'); // normalizado por el VO
    expect(result.value.fullName).toBe('Ada Lovelace');
    expect(result.value.id).toBeDefined();
  });

  it('hashea el password en texto plano antes de construir la entidad', async () => {
    await useCase.execute({
      email: 'ada@example.com',
      plainPassword: 'un-password-seguro',
      fullName: 'Ada Lovelace',
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith('un-password-seguro');
  });

  it('persiste el usuario a través del repositorio', async () => {
    await useCase.execute({
      email: 'ada@example.com',
      plainPassword: 'un-password-seguro',
      fullName: 'Ada Lovelace',
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('devuelve Result.fail(UserAlreadyExistsException) si el email ya existe, sin lanzar', async () => {
    userRepository.existsByEmail.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'ada@example.com',
      plainPassword: 'un-password-seguro',
      fullName: 'Ada Lovelace',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.name).toBe('UserAlreadyExistsException');
    expect(userRepository.save).not.toHaveBeenCalled();
    // clave: el use case NO debe hashear el password si el email ya existe
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it('lanza (no devuelve Result.fail) si el email tiene formato inválido', async () => {
    await expect(
      useCase.execute({
        email: 'esto-no-es-un-email',
        plainPassword: 'un-password-seguro',
        fullName: 'Ada Lovelace',
      }),
    ).rejects.toThrow();

    expect(userRepository.existsByEmail).not.toHaveBeenCalled();
  });
});
