export class RefreshTokenResponse {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
