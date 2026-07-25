import { Test, TestingModule } from '@nestjs/testing';
import { Result } from '@shared/application';
import { UsersController } from './users.controller';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { RegisterUserHttpRequestDto } from '../dtos/register-user-http.request.dto';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { RegisterUserResponse } from '../../application/use-cases/register-user/register-user.response';

describe('UsersController', () => {
  let controller: UsersController;
  let useCase: jest.Mocked<Pick<RegisterUserUseCase, 'execute'>>;

  const dto: RegisterUserHttpRequestDto = {
    email: 'nuevo@example.com',
    password: 'unPasswordSeguro123',
    fullName: 'Nombre Apellido',
  };

  beforeEach(async () => {
    useCase = { execute: jest.fn() };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: RegisterUserUseCase, useValue: useCase }],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('devuelve el DTO de respuesta cuando el Result es exitoso', async () => {
    const applicationResponse: RegisterUserResponse = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'nuevo@example.com',
      fullName: 'Nombre Apellido',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    useCase.execute.mockResolvedValue(Result.ok(applicationResponse));

    const response = await controller.register(dto);

    expect(response).toEqual(
      expect.objectContaining({
        id: applicationResponse.id,
        email: applicationResponse.email,
        fullName: applicationResponse.fullName,
      }),
    );
    expect(useCase.execute).toHaveBeenCalledWith({
      email: dto.email,
      plainPassword: dto.password,
      fullName: dto.fullName,
    });
  });

  it('lanza la DomainException real cuando el Result falla (para que el HttpExceptionFilter la mapee)', async () => {
    const error = new UserAlreadyExistsException(dto.email);
    useCase.execute.mockResolvedValue(Result.fail(error));

    await expect(controller.register(dto)).rejects.toThrow(UserAlreadyExistsException);
    await expect(controller.register(dto)).rejects.toBe(error);
  });
});
