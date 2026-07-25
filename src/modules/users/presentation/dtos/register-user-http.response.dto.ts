import { ApiProperty } from '@nestjs/swagger';
import { RegisterUserResponse } from '../../application/use-cases/register-user/register-user.response';

/**
 * DTO de HTTP para la respuesta. Se construye a partir del
 * `RegisterUserResponse` de application â€” nunca al revÃ©s, para que
 * application no dependa de Swagger ni de presentation.
 */
export class RegisterUserHttpResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  createdAt!: Date;

  private constructor(props: RegisterUserHttpResponseDto) {
    Object.assign(this, props);
  }

  static fromApplicationResponse(response: RegisterUserResponse): RegisterUserHttpResponseDto {
    return new RegisterUserHttpResponseDto({
      id: response.id,
      email: response.email,
      fullName: response.fullName,
      createdAt: response.createdAt,
    });
  }
}
