export interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  todayTransactions: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}
