export interface LoginRequest {
  nama: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_Token: string;
  nama: string;
  role: string;
}


