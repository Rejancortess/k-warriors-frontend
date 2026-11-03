import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ScanBarcode,
  PackagePlus,
  History,
  LogOut,
  User,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { authService, type AuthProfile } from "../../services/auth.service";

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

function formatRole(role: AuthProfile["role"]) {
  return role === "ADMIN" ? "Admin" : "Staff";
}

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!profile);

  useEffect(() => {
    if (profile) {
      setLoadingProfile(false);
      return;
    }

    let active = true;

    authService
      .fetchProfile()
      .then((next) => {
        if (active && next) setProfile(next);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [profile, setProfile]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

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
                  isActive ? "bg-primary text-white" : "hover:bg-slate-300"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 justify-between ">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-white rounded-full p-2">
            <User size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {loadingProfile ? "Loading..." : (profile?.name ?? "Guest")}
            </p>
            <p className="truncate text-sm text-slate-500">
              {profile ? formatRole(profile.role) : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Logout"
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
