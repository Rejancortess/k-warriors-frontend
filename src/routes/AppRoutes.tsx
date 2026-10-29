import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../components/layouts/MainLayout";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dasboard";
import Inventory from "../pages/inventory/Inventory";
import ScanProduct from "../pages/scan-product/ScanProduct";
import StockIn from "../pages/stock-in/StockIn";
import Transactions from "../pages/transactions/Transactions";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/scan-product" element={<ScanProduct />} />
        <Route path="/stock-in" element={<StockIn />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
