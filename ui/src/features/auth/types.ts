export interface LoginRequest {
  teamName: string;
  password: string;
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