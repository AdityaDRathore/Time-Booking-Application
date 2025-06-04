import apiClient, { ApiResponse, handleApiError } from './index';

// Types for login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Types for registration request payload
export interface RegisterRequest {
  user_name: string;
  user_email: string;
  user_password: string;
  organizationId?: string;  // Optional field
}

// Types for authentication response from backend
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
 * User login function
 * @param credentials - LoginRequest containing email and password
 * @returns Promise resolving to AuthResponse containing user info and token
 * Stores token in localStorage for subsequent requests
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    // Call login API endpoint with user credentials
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { token, user } = response.data.data;

    // Save token in localStorage for auth persistence
    localStorage.setItem('accessToken', token);

    return { token, user };
  } catch (error) {
    // Handle errors gracefully with helper function
    throw new Error(handleApiError(error));
  }
};

/**
 * User registration function
 * @param userData - RegisterRequest containing registration details
 * @returns Promise resolving to AuthResponse containing user info and token
 * Stores token in localStorage for subsequent requests
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    // Call register API endpoint with user data
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    const { token, user } = response.data.data;

    // Save token in localStorage for auth persistence
    localStorage.setItem('accessToken', token);

    return { token, user };
  } catch (error) {
    // Handle errors gracefully with helper function
    throw new Error(handleApiError(error));
  }
};

/**
 * User logout function
 * Calls logout API endpoint and removes token from localStorage
 */
export const logout = async (): Promise<void> => {
  try {
    // Notify backend about logout
    await apiClient.post('/auth/logout');

    // Remove token to clear authentication state on client
    localStorage.removeItem('accessToken');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Request password reset email
 * @param email - User email to send reset link
 */
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    // Call forgot-password API with user email
    await apiClient.post('/auth/forgot-password', { email });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Reset password with reset token and new password
 * @param token - Password reset token received via email
 * @param newPassword - New password string
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    // Call reset-password API with token and new password
    await apiClient.post('/auth/reset-password', { token, newPassword });
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
