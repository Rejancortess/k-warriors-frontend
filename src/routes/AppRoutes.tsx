import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { LoaderCircle } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout";
import { GuestRoute, ProtectedRoute } from "../components/auth/ProtectedRoute";

const Login = lazy(() => import("../pages/auth/Login"));
const Dashboard = lazy(() => import("../pages/dashboard/Dasboard"));
const Inventory = lazy(() => import("../pages/inventory/Inventory"));
const ScanProduct = lazy(() => import("../pages/scan-product/ScanProduct"));
const StockIn = lazy(() => import("../pages/stock-in/StockIn"));
const Transactions = lazy(() => import("../pages/transactions/Transactions"));
const Profile = lazy(() => import("../pages/account/Profile"));
const AccountSettings = lazy(() => import("../pages/account/Settings"));
const Security = lazy(() => import("../pages/account/Security"));

function PageFallback() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-canvas text-muted">
      <LoaderCircle className="animate-spin text-primary" size={28} />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function withSuspense(Page: LazyExoticComponent<ComponentType>) {
  return function SuspendedPage() {
    return (
      <Suspense fallback={<PageFallback />}>
        <Page />
      </Suspense>
    );
  };
}

const SuspendedLogin = withSuspense(Login);
const SuspendedDashboard = withSuspense(Dashboard);
const SuspendedInventory = withSuspense(Inventory);
const SuspendedScanProduct = withSuspense(ScanProduct);
const SuspendedStockIn = withSuspense(StockIn);
const SuspendedTransactions = withSuspense(Transactions);
const SuspendedProfile = withSuspense(Profile);
const SuspendedAccountSettings = withSuspense(AccountSettings);
const SuspendedSecurity = withSuspense(Security);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<SuspendedLogin />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<SuspendedDashboard />} />
          <Route path="/inventory" element={<SuspendedInventory />} />
          <Route path="/scan-product" element={<SuspendedScanProduct />} />
          <Route path="/stock-in" element={<SuspendedStockIn />} />
          <Route path="/transactions" element={<SuspendedTransactions />} />
          <Route path="/account" element={<SuspendedProfile />} />
          <Route path="/account/settings" element={<SuspendedAccountSettings />} />
          <Route path="/account/security" element={<SuspendedSecurity />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
