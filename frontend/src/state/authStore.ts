import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  login: (token, user) =>
    set({ token, user, isLoggedIn: true }),
  logout: () =>
    set({ token: null, user: null, isLoggedIn: false }),
}));
