import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user/register-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RegisterUserHttpRequestDto } from '../dtos/register-user-http.request.dto';
import { RegisterUserHttpResponseDto } from '../dtos/register-user-http.response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenHttpRequestDto } from '../dtos/refresh-token-http.request.dto';
import { LogoutHttpRequestDto } from '../dtos/logout-http.request.dto';
import { TokenPairHttpResponseDto } from '../dtos/token-pair-http.response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokenPairHttpResponseDto })
  async login(@Body() dto: LoginDto): Promise<TokenPairHttpResponseDto> {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
    return new TokenPairHttpResponseDto(result.accessToken, result.refreshToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokenPairHttpResponseDto })
  async refresh(@Body() dto: RefreshTokenHttpRequestDto): Promise<TokenPairHttpResponseDto> {
    const result = await this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
    });
    return new TokenPairHttpResponseDto(result.accessToken, result.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: LogoutHttpRequestDto): Promise<void> {
    await this.logoutUseCase.execute({
      refreshToken: dto.refreshToken,
    });
  }
}
