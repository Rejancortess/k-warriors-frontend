import { api } from "../lib/api";

export interface CreateStaffInput {
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

export const userService = {
  getAll: async () => {
    const response = await api.get("/users");
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
