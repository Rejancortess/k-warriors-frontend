import { api } from "../lib/api";
import type { ApiResponse } from "../types/product.types";
import type {
  StockMovementInput,
  StockTransaction,
} from "../types/stock.types";

export const stockService = {
  // POST /api/stock/in
  stockIn: async (data: StockMovementInput) => {
    const response = await api.post<ApiResponse<StockTransaction>>(
      "/stock/in",
      data,
    );

    return response.data;
  },

  // POST /api/stock/out
  stockOut: async (data: StockMovementInput) => {
    const response = await api.post<ApiResponse<StockTransaction>>(
      "/stock/out",
      data,
    );

    return response.data;
  },
};
