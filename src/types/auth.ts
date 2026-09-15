export interface LoginRequest {
  nama: string;
  password: string;
}

/**
 * LoginResponse dari backend — ASP.NET serializer menerapkan camelCase,
 * jadi JSON aktual: { token, refresh_Token, nama, role } (bukan PascalCase).
 */
export interface LoginResponse {
  token: string;
  refresh_Token: string;
  nama: string;
  role: string;
}