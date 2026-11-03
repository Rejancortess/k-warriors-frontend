import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LoaderCircle, Search, UserRound } from "lucide-react";

import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

export default function Header() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="relative w-full max-w-md" ref={containerRef}>
        <Search
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
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
          className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 outline-none focus:border-blue-500"
        />

        {showResults ? (
          <div
            id="product-search-results"
            className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-100"
          >
            {loading || !settled ? (
              <p className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Searching...
              </p>
            ) : error ? (
              <p className="px-4 py-3 text-sm text-red-600">{error}</p>
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
                            low ? "text-red-600" : "text-slate-500"
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
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-gray-600 hover:text-blue-600"
        >
          <Bell size={22} />
        </button>

        <button
          type="button"
          aria-label="User profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <UserRound size={22} />
        </button>
      </div>
    </header>
  );
}
