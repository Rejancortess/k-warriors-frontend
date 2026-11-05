import { create } from "zustand";
import type { User } from "firebase/auth";

import { authService, type AuthProfile } from "../services/auth.service";

interface AuthState {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: AuthProfile | null) => void;
  setLoading: (loading: boolean) => void;

  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  login: async (email, password) => {
    const { user, profile } = await authService.login(email, password);
    set({ user, profile, loading: false });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, profile: null, loading: false });
  },
}));
