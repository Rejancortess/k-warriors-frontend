import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LoaderCircle,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import NotificationMenu from "./NotificationMenu";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";
import { useAuthStore } from "../../stores/useAuthStore";
import type { AuthProfile } from "../../services/auth.service";

const accountItems = [
  {
    label: "My Profile",
    detail: "View account details",
    icon: UserRound,
    to: "/account",
  },
  {
    label: "Account Settings",
    detail: "Update account preferences",
    icon: Settings,
    to: "/account/settings",
  },
  {
    label: "Security",
    detail: "Change password",
    icon: ShieldCheck,
    to: "/account/security",
  },
];

function roleLabel(role: AuthProfile["role"]) {
  return role === "ADMIN" ? "Administrator" : "Staff";
}

export default function Header() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const accountEmail = useAuthStore((state) => state.user?.email);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const query = search.trim();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setResultsQuery("");
      setError("");
      setLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setOpen(true);

      productService
        .search(query)
        .then((response) => {
          if (!active) return;
          setResults(response.data ?? []);
          setResultsQuery(query);
          setError("");
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setResultsQuery(query);
          setError("Couldn't search products.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function closeResults(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeResults);
    return () => document.removeEventListener("mousedown", closeResults);
  }, []);

  const showResults = open && query.length > 0;
  const settled = resultsQuery === query && !loading;

  function openInInventory(product: Product) {
    setOpen(false);
    setSearch("");
    navigate(`/inventory?q=${encodeURIComponent(product.name)}`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setMenuOpen(false);
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  const displayName = profile?.name || "Guest";
  const displayRole = profile ? roleLabel(profile.role) : "";
  const displayEmail = profile?.email || accountEmail || "";

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
      <div className="relative w-full max-w-md" ref={containerRef}>
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search products..."
          role="combobox"
          aria-expanded={showResults}
          aria-controls="product-search-results"
          aria-autocomplete="list"
          className="w-full rounded-lg border border-line py-2 pr-4 pl-10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />

        {showResults ? (
          <div
            id="product-search-results"
            className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-line"
          >
            {loading || !settled ? (
              <p className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Searching...
              </p>
            ) : error ? (
              <p className="px-4 py-3 text-sm text-warning">{error}</p>
            ) : results.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No products found.</p>
            ) : (
              <ul role="listbox" aria-label="Matching products">
                {results.map((product) => {
                  const low = product.quantity < product.minStock;

                  return (
                    <li key={product.id} role="option" aria-selected={false}>
                      <button
                        type="button"
                        onClick={() => openInInventory(product)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {product.barcode || product.sku}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-xs font-semibold ${
                            low ? "text-warning" : "text-slate-500"
                          }`}
                        >
                          {product.quantity.toLocaleString()} units
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="ml-4 flex items-center gap-5">
        <NotificationMenu
          open={notesOpen}
          onOpenChange={(next) => {
            setNotesOpen(next);
            if (next) {
              setMenuOpen(false);
              setOpen(false);
            }
          }}
        />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="User profile"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => {
              setMenuOpen((current) => !current);
              setNotesOpen(false);
              setOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink hover:bg-slate-200"
          >
            <UserRound size={22} />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-40 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-xl"
            >
              <div className="flex items-start gap-3 px-1 pb-4">
                <UserRound size={28} className="mt-0.5 shrink-0 text-slate-700" />
                <div className="min-w-0">
                  <p className="truncate text-base font-bold">{displayName}</p>
                  {displayRole ? (
                    <p className="mt-0.5 text-sm text-slate-500">{displayRole}</p>
                  ) : null}
                  {displayEmail ? (
                    <p className="truncate text-sm text-slate-500">{displayEmail}</p>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(item.to);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left hover:bg-slate-50"
                    >
                      <Icon size={20} className="shrink-0 text-slate-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="block text-sm text-slate-500">{item.detail}</span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  role="menuitem"
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-sm font-semibold text-warning hover:bg-slate-50 disabled:opacity-60"
                >
                  <LogOut size={18} />
                  {loggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
