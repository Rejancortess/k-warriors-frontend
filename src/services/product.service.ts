import { api } from "../lib/api";

import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ApiResponse,
  PaginatedResponse,
} from "../types/product.types";

const BASE_URL = "/products";

export const productService = {
  // GET /api/products
  getAll: async (filters?: ProductFilters) => {
    const response = await api.get<PaginatedResponse<Product>>(BASE_URL, {
      params: filters,
    });

    return response.data;
  },

  // GET /api/products/search?q=
  search: async (query: string) => {
    const response = await api.get<ApiResponse<Product[]>>(`${BASE_URL}/search`, {
      params: { q: query },
    });

    return response.data;
  },

  // GET /api/products/:id
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`${BASE_URL}/${id}`);

    return response.data;
  },

  // GET /api/products/barcode/:barcode
  getByBarcode: async (barcode: string) => {
    const response = await api.get<ApiResponse<Product>>(
      `${BASE_URL}/barcode/${encodeURIComponent(barcode)}`,
    );

    return response.data;
  },

  // GET /api/products/sku/:sku
  getBySku: async (sku: string) => {
    const response = await api.get<ApiResponse<Product>>(
      `${BASE_URL}/sku/${encodeURIComponent(sku)}`,
    );

    return response.data;
  },

  // GET /api/products/stats
  getStats: async () => {
    const response = await api.get<ApiResponse<Record<string, number>>>(
      `${BASE_URL}/stats`,
    );

    return response.data;
  },

  // GET /api/products/low-stock
  getLowStock: async () => {
    const response = await api.get<ApiResponse<Product[]>>(
      `${BASE_URL}/low-stock`,
    );

    return response.data;
  },

  // GET /api/products/out-of-stock
  getOutOfStock: async () => {
    const response = await api.get<ApiResponse<Product[]>>(
      `${BASE_URL}/out-of-stock`,
    );

    return response.data;
  },

  // POST /api/products
  create: async (data: CreateProductInput) => {
    const response = await api.post<ApiResponse<Product>>(BASE_URL, data);

    return response.data;
  },

  // PATCH /api/products/:id
  update: async (id: string, data: UpdateProductInput) => {
    const response = await api.patch<ApiResponse<Product>>(
      `${BASE_URL}/${id}`,
      data,
    );

    return response.data;
  },

  // DELETE /api/products/:id
  archive: async (id: string) => {
    const response = await api.delete<ApiResponse<Product>>(
      `${BASE_URL}/${id}`,
    );

    return response.data;
  },

  // PATCH /api/products/:id/restore
  restore: async (id: string) => {
    const response = await api.patch<ApiResponse<Product>>(
      `${BASE_URL}/${id}/restore`,
    );

    return response.data;
  },

  // GET /api/products/:id/transactions
  getTransactions: async (id: string) => {
    const response = await api.get(`${BASE_URL}/${id}/transactions`);

    return response.data;
  },
};
