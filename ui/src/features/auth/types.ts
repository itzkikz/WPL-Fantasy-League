export interface LoginRequest {
  credential: string;
}

export interface LoginResponse {
  token: string;
}

export interface ValidateResponse {
  valid: boolean,
  user: User
}

export interface User {
  userId: string,
  info: string,
  iat: number
}