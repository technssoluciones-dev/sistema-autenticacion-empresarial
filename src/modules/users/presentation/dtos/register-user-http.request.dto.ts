import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO de HTTP (`class-validator` + Swagger). Distinto del
 * `RegisterUserRequest` de `application` â€” este es el contrato que
 * expone la API, el otro es el contrato interno del use case.
 *
 * `@IsEmail()` acÃ¡ es la validaciÃ³n de formato en la que confÃ­a
 * `RegisterUserUseCase` (ver el comentario en `register-user.use-case.ts`):
 * si un email mal formado llega hasta `Email.create()`, algo se saltÃ³
 * esta capa.
 */
export class RegisterUserHttpRequestDto {
  @ApiProperty({ example: 'usuario@empresa.com' })
  @IsEmail({}, { message: 'El email no tiene un formato vÃ¡lido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'unPasswordSeguro123', minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'El password debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'El password no puede superar los 72 caracteres (lÃ­mite de bcrypt)' })
  password!: string;

  @ApiProperty({ example: 'Nombre Apellido' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;
}
