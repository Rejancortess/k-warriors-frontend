import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  PackagePlus,
  History,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
  },
  {
    name: "Scan Product",
    path: "/scan-product",
    icon: ScanBarcode,
  },
  {
    name: "Stock In",
    path: "/stock-in",
    icon: PackagePlus,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: History,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col p-5 text-black border-r border-slate-300">
      <div className="flex mb-10 items-center">
        <img
          src="/logo.svg"
          alt="logo"
          className="w-10 h-10 object-contain mr-4 "
        />
        <div>
          <h1 className=" text-xl font-bold">K-WARRIORS</h1>
          <p className="text-sm ">Inventory System</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg p-3 transition ${
                  isActive ? "bg-green-600 text-white" : "hover:bg-slate-300"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        disabled
        className="flex items-center gap-3 rounded-lg p-3 opacity-50"
        title="Logout will be enabled after authentication is connected"
      >
        <LogOut size={20} />
        <NavLink to="/">Logout</NavLink>
      </button>
    </aside>
  );
}
