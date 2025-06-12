import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: '1',
  user_name: 'Ojasv',
  user_email: 'ojasv@example.com',
  user_role: 'student',
  createdAt: '',
  updatedAt: '',
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  localStorage.clear();
});

describe('authStore', () => {
  it('should set auth correctly', () => {
    const { setAuth } = useAuthStore.getState();

    setAuth(mockUser, 'token-123');

    const state = useAuthStore.getState();

    expect(state.user?.user_name).toBe('Ojasv');
    expect(state.token).toBe('token-123');
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('token-123');
  });

  it('should clear auth correctly', () => {
    const { setAuth, clearAuth } = useAuthStore.getState();

    setAuth(mockUser, 'token-123');
    clearAuth();

    const state = useAuthStore.getState();

    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
