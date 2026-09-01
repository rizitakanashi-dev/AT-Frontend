export interface LoginRequest {
  nama: string;
  password: string;
}

export interface LoginResponse {
  Token: string;
  Refresh_Token: string;
  Nama: string;
  Role: string;
}


