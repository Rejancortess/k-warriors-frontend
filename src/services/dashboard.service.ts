import { api } from "../lib/api";

import type {
  DashboardStats,
  DashboardStatsResponse,
} from "../types/dashboard.types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStatsResponse>("/dashboard/stats");

    return response.data.data;
  },
};
