import { api } from "../lib/api";
import type { ApiResponse } from "../types/product.types";

export interface CreateStaffInput {
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
}

export const userService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<AccountUser[]>>("/users");
    return response.data;
  },

  updateRole: async (id: string, role: AccountUser["role"]) => {
    const response = await api.patch<ApiResponse<AccountUser>>(`/users/${id}`, {
      role,
    });
    return response.data;
  },

  create: async (data: CreateStaffInput) => {
    const response = await api.post("/users", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateStaffInput> & {
      isActive?: boolean;
    },
  ) => {
    const response = await api.patch(`/users/${id}`, data);

    return response.data;
  },
};
