import { api } from "../lib/api";

import type { PaginatedResponse } from "../types/product.types";

import type { TransactionListItem } from "../types/stock.types";

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: "STOCK_IN" | "STOCK_OUT";
  search?: string;
}

export const transactionService = {
  // GET /api/transactions
  getAll: async (filters?: TransactionFilters) => {
    const response = await api.get<PaginatedResponse<TransactionListItem>>(
      "/transactions",
      {
        params: filters,
      },
    );

    return response.data;
  },

  // GET /api/transactions/:id
  // Use after implementing this route in Express
  getById: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);

    return response.data;
  },
};
