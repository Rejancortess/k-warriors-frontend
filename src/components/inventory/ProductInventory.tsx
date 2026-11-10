import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Barcode,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import axios from "axios";

import { useAuthStore } from "../../stores/useAuthStore";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

const PAGE_SIZE = 5;

type StatusFilter = "all" | "normal" | "low";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "normal", label: "Normal" },
  { id: "low", label: "Low Stock" },
];

function isLowStock(product: Product) {
  return product.quantity < product.minStock;
}

function pageItems(current: number, total: number) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);

  if (current <= 3) {
    pages.add(2);
    pages.add(3);
  }

  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right);

  const items: Array<number | "ellipsis"> = [];

  for (const page of sorted) {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  }

  return items;
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }

  return fallback;
}

export default function ProductInventory() {
  const [searchParams] = useSearchParams();
  const menuRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deniedAction, setDeniedAction] = useState<"edit" | "delete" | null>(null);
  const isStaff = useAuthStore((state) => state.profile?.role === "STAFF");

  function requestEdit(product: Product) {
    if (isStaff) {
      setDeniedAction("edit");
      return;
    }
    setEditing(product);
  }

  function requestDelete(product: Product) {
    if (isStaff) {
      setDeniedAction("delete");
      return;
    }
    setPendingDelete(product);
  }

  useEffect(() => {
    let active = true;

    productService
      .getAll()
      .then((response) => {
        if (!active) return;
        setProducts(response.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load products.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const next = searchParams.get("q") ?? "";
    if (!next) return;

    setSearch(next);
    setStatus("all");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (!menuOpen) return;

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [menuOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        (product.barcode ?? "").toLowerCase().includes(query);
      const low = isLowStock(product);
      const matchesStatus =
        status === "all" ||
        (status === "low" && low) ||
        (status === "normal" && !low);

      return matchesQuery && matchesStatus;
    });
  }, [products, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : start + 1;
  const to = start + visible.length;
  const filterLabel = FILTERS.find((item) => item.id === status)?.label ?? "All";

  function selectStatus(next: StatusFilter) {
    setStatus(next);
    setPage(1);
    setMenuOpen(false);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Filter products by name, or barcode..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pr-4 pl-11 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="relative self-end sm:self-auto" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            {filterLabel}
          </button>
          {menuOpen ? (
            <ul
              role="listbox"
              aria-label="Filter by status"
              className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-line"
            >
              {FILTERS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={status === item.id}
                    onClick={() => selectStatus(item.id)}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      status === item.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-line">
        {loading ? (
          <p className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Loading products...
          </p>
        ) : error ? (
          <p className="px-6 py-16 text-center text-sm text-warning">{error}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-canvas text-sm font-medium text-slate-500">
                    <th className="px-4 py-4 text-left font-medium whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="px-4 py-4 text-center font-medium">Barcode</th>
                    <th className="px-4 py-4 text-center font-medium leading-tight whitespace-nowrap">
                      Current
                      <br />
                      Stock
                    </th>
                    <th className="px-4 py-4 text-center font-medium">Status</th>
                    <th className="px-4 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center text-sm text-slate-500"
                      >
                        No products match that filter.
                      </td>
                    </tr>
                  ) : (
                    visible.map((product, index) => {
                      const low = isLowStock(product);

                      return (
                        <tr
                          key={product.id}
                          className={
                            index === visible.length - 1
                              ? ""
                              : "border-b border-line"
                          }
                        >
                          <td className="px-4 py-5 text-sm font-bold whitespace-nowrap text-slate-950">
                            {product.name}
                          </td>
                          <td className="px-4 py-5 text-center">
                            <span className="inline-flex items-center gap-2 rounded-lg bg-link/10 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-slate-600">
                              <Barcode size={15} className="text-slate-400" />
                              {product.barcode || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-center text-sm font-bold whitespace-nowrap">
                            <span className={low ? "text-warning" : "text-slate-950"}>
                              {product.quantity.toLocaleString()}
                            </span>{" "}
                            <span
                              className={`font-medium ${
                                low ? "text-warning" : "text-slate-400"
                              }`}
                            >
                              units
                            </span>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                low
                                  ? "bg-warning/15 text-warning"
                                  : "bg-success/15 text-success"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  low ? "bg-warning" : "bg-success"
                                }`}
                              />
                              {low ? "Low Stock" : "Normal"}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => requestEdit(product)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
                              >
                                <Pencil size={15} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDelete(product)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-warning hover:text-warning"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Showing {from}-{to} of {filtered.length} registered products
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                  className="flex h-8 w-8 items-center justify-center text-slate-400 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageItems(currentPage, totalPages).map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-sm text-slate-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      aria-current={item === currentPage ? "page" : undefined}
                      onClick={() => setPage(item)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        item === currentPage
                          ? "bg-primary text-white"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  className="flex h-8 w-8 items-center justify-center text-slate-400 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {editing ? (
        <EditProductDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={(next) => {
            setProducts((current) =>
              current.map((item) => (item.id === next.id ? next : item)),
            );
            setEditing(null);
          }}
        />
      ) : null}

      {pendingDelete ? (
        <DeleteProductDialog
          product={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onDeleted={(id) => {
            setProducts((current) => current.filter((item) => item.id !== id));
            setPendingDelete(null);
          }}
        />
      ) : null}

      {deniedAction ? (
        <StaffActionWarning
          action={deniedAction}
          onClose={() => setDeniedAction(null)}
        />
      ) : null}
    </div>
  );
}

function StaffActionWarning({
  action,
  onClose,
}: {
  action: "edit" | "delete";
  onClose: () => void;
}) {
  const verb = action === "edit" ? "edit" : "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-labelledby="staff-action-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <AlertTriangle size={20} />
        </div>
        <h2 id="staff-action-title" className="mt-4 text-lg font-bold text-slate-950">
          You can't {verb} products
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Staff accounts can view inventory, but only an administrator can {verb} a
          product.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProductDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (product: Product) => void;
}) {
  const [name, setName] = useState(product.name);
  const [barcode, setBarcode] = useState(product.barcode ?? "");
  const [minStock, setMinStock] = useState(String(product.minStock));
  const [price, setPrice] = useState(product.price ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const minStockValue = Number(minStock);
    const priceValue = price.trim() === "" ? null : Number(price);

    if (!trimmedName || minStock.trim() === "" || !Number.isInteger(minStockValue)) {
      setMessage("Name and minimum stock are required.");
      return;
    }

    if (priceValue !== null && (Number.isNaN(priceValue) || priceValue < 0)) {
      setMessage("Enter a valid price.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await productService.update(product.id, {
        name: trimmedName,
        barcode: barcode.trim(),
        minStock: minStockValue,
        price: priceValue ?? undefined,
      });
      onSaved(response.data);
    } catch (error) {
      setMessage(errorMessage(error, "Couldn't update the product."));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <form
        role="dialog"
        aria-labelledby="edit-product-title"
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="edit-product-title" className="text-lg font-bold text-slate-950">
          Edit product
        </h2>
        <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="edit-name">
          Product name
        </label>
        <input
          id="edit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <label className="mt-4 block text-sm font-semibold text-slate-800" htmlFor="edit-barcode">
          Barcode
        </label>
        <input
          id="edit-barcode"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="edit-min">
              Minimum stock
            </label>
            <input
              id="edit-min"
              inputMode="numeric"
              value={minStock}
              onChange={(event) => setMinStock(event.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="edit-price">
              Price
            </label>
            <input
              id="edit-price"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(/[^\d.]/g, ""))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        {message ? (
          <p className="mt-4 text-sm text-warning" role="alert">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteProductDialog({
  product,
  onClose,
  onDeleted,
}: {
  product: Product;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setMessage("");

    try {
      await productService.archive(product.id);
      onDeleted(product.id);
    } catch (error) {
      setMessage(errorMessage(error, "Couldn't delete the product."));
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-labelledby="delete-product-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="delete-product-title" className="text-lg font-bold text-slate-950">
          Delete {product.name}?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          This removes the product from the inventory.
        </p>
        {message ? (
          <p className="mt-4 text-sm text-warning" role="alert">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
