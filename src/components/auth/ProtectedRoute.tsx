import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import { useAuthStore } from "../../stores/useAuthStore";

function AuthLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F9F9FF] text-slate-500">
      <LoaderCircle className="animate-spin text-primary" size={28} />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <AuthLoading />;
  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <AuthLoading />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
