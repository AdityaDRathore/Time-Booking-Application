import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../state/authStore';

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

describe('ProtectedRoute', () => {
  it('renders children if authenticated', () => {
    useAuthStore.setState({
      user: mockUser,
      token: 'token123',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('redirects to login if not authenticated', () => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Content')).toBeNull();
  });
});
