import apiClient, { ApiResponse, handleApiError } from './index';

// Types for auth requests/responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  user_name: string;
  user_email: string;
  user_password: string;
  organizationId?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    user_name: string;
    user_email: string;
    user_role: string;
  };
  token: string;
}

/**
 * User login
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { token, user } = response.data.data;

    // Store token for future requests
    localStorage.setItem('accessToken', token);

    return { token, user };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * User registration
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    const { token, user } = response.data.data;

    // Store token for future requests
    localStorage.setItem('accessToken', token);

    return { token, user };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * User logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await apiClient.post('/auth/forgot-password', { email });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};