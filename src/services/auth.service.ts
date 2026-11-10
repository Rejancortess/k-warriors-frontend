import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/product.types";

export interface AuthProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
}

async function syncProfile(name?: string) {
  const response = await api.post<ApiResponse<AuthProfile>>("/auth/sync", {
    name,
  });

  return response.data.data;
}

export const authService = {
  login: async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    try {
      const profile = await syncProfile(result.user.displayName ?? undefined);
      return { user: result.user, profile };
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  requestPasswordReset: async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  },

  changePassword: async (currentPassword: string, nextPassword: string) => {
    const current = auth.currentUser;

    if (!current?.email) {
      throw new Error("Sign in again before changing your password.");
    }

    const credential = EmailAuthProvider.credential(
      current.email,
      currentPassword,
    );
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, nextPassword);
  },

  updateName: async (name: string) => {
    const response = await api.patch<ApiResponse<AuthProfile>>("/auth/profile", {
      name,
    });
    const current = auth.currentUser;

    if (current) {
      try {
        await updateProfile(current, { displayName: response.data.data.name });
      } catch {
        // The saved name still comes from the account record.
      }
    }

    return response.data.data;
  },

  fetchProfile: async () => {
    await auth.authStateReady();

    const current = auth.currentUser;
    if (!current) return null;

    return syncProfile(current.displayName ?? undefined);
  },

  onAuthChanged: (callback: Parameters<typeof onAuthStateChanged>[1]) => {
    return onAuthStateChanged(auth, callback);
  },

  // Requires GET /api/auth/me in Express
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
