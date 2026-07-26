export const TOKEN_HASHER = 'TOKEN_HASHER';

export interface TokenHasher {
  hash(token: string): Promise<string>;
}
