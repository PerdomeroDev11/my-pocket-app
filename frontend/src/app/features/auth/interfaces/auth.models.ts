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
  id: string;
  name: string;
  email: string;
  verifyEmail: boolean;
  status: string;
}

export interface GoogleLoginDto{
  idToken: string
}