export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  quantity: number;
  minStock: number;
  price: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  minStock?: number;
  price?: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  includeArchived?: boolean;
}
