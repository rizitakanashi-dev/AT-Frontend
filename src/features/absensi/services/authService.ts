import api from "../../../lib/api";
import { LoginRequest, LoginResponse } from "../../../types/auth";

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};