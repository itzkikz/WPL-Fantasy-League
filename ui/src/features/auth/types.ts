export interface LoginRequest {
  credential: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    username: string;
    role?: string;
  };
}

export interface ValidateResponse {
  valid: boolean,
  user: User
}

export interface User {
  userId: string,
  info: string,
  role?: string,
  iat: number
}