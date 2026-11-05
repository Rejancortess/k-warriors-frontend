import axios from "axios";
import { auth } from "./firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Automatically attach Firebase token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();

    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
