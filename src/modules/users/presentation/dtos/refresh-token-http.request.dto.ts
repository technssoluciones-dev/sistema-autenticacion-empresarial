import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenHttpRequestDto {
  @ApiProperty({ example: 'a3f1c2e4-...-refresh-token-opaco' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
