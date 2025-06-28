import apiClient, { ApiResponse, handleApiError } from './index';
import { useAuthStore } from '../state/authStore';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

/**
 * 👉 User login
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { accessToken, user } = response.data.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return { accessToken, user };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 👉 User registration
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    const { accessToken, user } = response.data.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return { accessToken, user };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 👉 User logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    useAuthStore.getState().clearAuth();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 👉 Request password reset
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await apiClient.post('/auth/forgot-password', { email });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * 👉 Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
