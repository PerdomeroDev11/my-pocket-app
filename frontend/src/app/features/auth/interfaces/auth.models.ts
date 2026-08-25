export interface LoginDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface AuthResponse {
  message: string;
}

export interface User {
  name: string;
  email: string;
  verifyEmail: boolean;
  status: string;
}

export interface GoogleLoginDto{
  idToken: string
}
export interface RefreshTokenDto{
  userId: string;
  email: string;
  sessionId: string
}

