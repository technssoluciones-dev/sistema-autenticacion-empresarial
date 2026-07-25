import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { RegisterUserHttpRequestDto } from '../dtos/register-user-http.request.dto';
import { RegisterUserHttpResponseDto } from '../dtos/register-user-http.response.dto';

/**
 * Adaptador delgado entre HTTP y `application`: recibe el DTO ya
 * validado por `class-validator`, arma el `RegisterUserRequest` interno,
 * llama al use case y traduce el `Result` a una respuesta HTTP.
 *
 * `if (result.isFailure) throw result.error` â€” el error sigue siendo la
 * `DomainException` real (`UserAlreadyExistsException`); el
 * `HttpExceptionFilter` global ya sabe mapearla a 409. El controller no
 * decide el cÃ³digo de estado del error, solo delega.
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: RegisterUserHttpResponseDto })
  @ApiConflictResponse({ description: 'Ya existe un usuario registrado con ese email' })
  async register(@Body() dto: RegisterUserHttpRequestDto): Promise<RegisterUserHttpResponseDto> {
    const result = await this.registerUserUseCase.execute({
      email: dto.email,
      plainPassword: dto.password,
      fullName: dto.fullName,
    });

    if (result.isFailure) {
      throw result.error;
    }

    return RegisterUserHttpResponseDto.fromApplicationResponse(result.value);
  }
}
