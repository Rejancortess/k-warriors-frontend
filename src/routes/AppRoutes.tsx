import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout";
import { GuestRoute, ProtectedRoute } from "../components/auth/ProtectedRoute";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dasboard";
import Inventory from "../pages/inventory/Inventory";
import ScanProduct from "../pages/scan-product/ScanProduct";
import StockIn from "../pages/stock-in/StockIn";
import Transactions from "../pages/transactions/Transactions";
import Profile from "../pages/account/Profile";
import AccountSettings from "../pages/account/Settings";
import Security from "../pages/account/Security";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/scan-product" element={<ScanProduct />} />
          <Route path="/stock-in" element={<StockIn />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/account" element={<Profile />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/account/security" element={<Security />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
