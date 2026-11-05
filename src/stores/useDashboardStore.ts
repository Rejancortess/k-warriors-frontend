import { create } from "zustand";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardStats } from "../types/dashboard.types";

interface DashboardStore {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  clearStats: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      const data = await dashboardService.getStats();

      set({
        stats: data,
        loading: false,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);

      set({
        error: "Failed to load dashboard statistics",
        loading: false,
      });
    }
  },

  clearStats: () => {
    set({
      stats: null,
      error: null,
      loading: false,
    });
  },
}));
