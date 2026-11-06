export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
}

export interface RegistrationRequest {
  usuario: string;
  email: string;
  password: string;
}
