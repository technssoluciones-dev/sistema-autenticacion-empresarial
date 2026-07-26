export class LoginResponse {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
