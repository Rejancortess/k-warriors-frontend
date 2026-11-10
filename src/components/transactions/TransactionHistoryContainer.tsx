import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Search,
} from "lucide-react";

import { transactionService } from "../../services/transaction.service";
import type { TransactionListItem } from "../../types/stock.types";

const PAGE_SIZE = 8;

type Period = "all" | "today" | "week" | "month";
type TypeFilter = "all" | "STOCK_IN" | "STOCK_OUT";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "Past 7 Days" },
  { id: "month", label: "This Month" },
];

const TYPES: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "STOCK_IN", label: "Stock In" },
  { id: "STOCK_OUT", label: "Stock Out" },
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function periodRange(period: Period) {
  const now = new Date();
  if (period === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (period === "week") {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(now) };
  }
  if (period === "month") {
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }
  return null;
}

function formatDay(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = formatDay(date);
  const time = date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${day} • ${time}`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
  return letters.toUpperCase() || "?";
}

function avatarColor(name: string) {
  const colors = ["bg-primary", "bg-muted", "bg-link", "bg-success"];
  const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[total % colors.length];
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
    if (typeof previous === "number" && page - previous > 1) items.push("ellipsis");
    items.push(page);
  }

  return items;
}

export default function TransactionHistoryContainer() {
  const typeRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [typeOpen, setTypeOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [sortType, setSortType] = useState<"none" | "asc" | "desc">("none");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const first = await transactionService.getAll({ page: 1, limit: 100 });
        if (!active) return;
        const items = [...(first.data ?? [])];
        const totalPages = first.pagination?.totalPages ?? 1;

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              transactionService.getAll({ page: index + 2, limit: 100 }),
            ),
          );
          if (!active) return;
          for (const response of rest) items.push(...(response.data ?? []));
        }

        setTransactions(items);
      } catch {
        if (active) setError("Couldn't load transactions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function closeMenus(event: MouseEvent) {
      if (!typeRef.current?.contains(event.target as Node)) setTypeOpen(false);
      if (!rangeRef.current?.contains(event.target as Node)) setRangeOpen(false);
    }

    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const range = useMemo(() => {
    if (customFrom || customTo) {
      return {
        from: customFrom ? startOfDay(new Date(`${customFrom}T00:00:00`)) : null,
        to: customTo ? endOfDay(new Date(`${customTo}T00:00:00`)) : null,
      };
    }
    return periodRange(period);
  }, [customFrom, customTo, period]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matched = transactions.filter((item) => {
      const name = item.product?.name?.toLowerCase() ?? "";
      const sku = item.product?.sku?.toLowerCase() ?? "";
      const barcode = item.product?.barcode?.toLowerCase() ?? "";
      const matchesQuery =
        query.length === 0 ||
        name.includes(query) ||
        sku.includes(query) ||
        barcode.includes(query);
      const matchesType = type === "all" || item.type === type;
      const created = new Date(item.createdAt).getTime();
      const matchesRange =
        !range ||
        ((range.from === null || created >= range.from.getTime()) &&
          (range.to === null || created <= range.to.getTime()));

      return matchesQuery && matchesType && matchesRange;
    });

    if (sortType === "none") return matched;

    return [...matched].sort((left, right) => {
      const order = left.type.localeCompare(right.type);
      return sortType === "asc" ? order : -order;
    });
  }, [transactions, search, type, range, sortType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const typeLabel = TYPES.find((item) => item.id === type)?.label ?? "All Types";
  const rangeLabel =
    range?.from && range.to
      ? `${formatDay(range.from)} - ${formatDay(range.to)}`
      : range?.from
        ? `From ${formatDay(range.from)}`
        : range?.to
          ? `Until ${formatDay(range.to)}`
          : "All time";

  function selectPeriod(next: Period) {
    setPeriod(next);
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-line sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
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
            placeholder="Search by product name, barcode."
            className="w-full rounded-full bg-canvas py-3 pr-4 pl-11 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="relative" ref={rangeRef}>
          <button
            type="button"
            onClick={() => setRangeOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
          >
            <Calendar size={16} className="text-slate-400" />
            {rangeLabel}
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {rangeOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl bg-white p-4 shadow-lg ring-1 ring-line">
              <label className="block text-xs font-semibold text-slate-500" htmlFor="from-date">
                From
              </label>
              <input
                id="from-date"
                type="date"
                value={customFrom}
                onChange={(event) => {
                  setCustomFrom(event.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              />
              <label className="mt-3 block text-xs font-semibold text-slate-500" htmlFor="to-date">
                To
              </label>
              <input
                id="to-date"
                type="date"
                value={customTo}
                onChange={(event) => {
                  setCustomTo(event.target.value);
                  setPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold tracking-wide text-slate-400">
            PERIOD:
          </span>
          {PERIODS.map((item) => {
            const active = !customFrom && !customTo && period === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPeriod(item.id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  active
                    ? "bg-link/10 font-semibold text-slate-800"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2" ref={typeRef}>
          <span className="text-xs font-semibold tracking-wide text-slate-400">TYPE:</span>
          <div className="relative">
            <button
              type="button"
              aria-expanded={typeOpen}
              onClick={() => setTypeOpen((open) => !open)}
              className="rounded-full bg-link/10 px-3 py-1.5 text-sm font-semibold text-slate-800"
            >
              {typeLabel}
            </button>
            {typeOpen ? (
              <ul className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-line">
                {TYPES.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setType(item.id);
                        setTypeOpen(false);
                        setPage(1);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        type === item.id
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
      </div>

      {loading ? (
        <p className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
          <LoaderCircle size={16} className="animate-spin" />
          Loading transactions...
        </p>
      ) : error ? (
        <p className="px-6 py-16 text-center text-sm text-warning">{error}</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="bg-canvas text-left text-sm font-medium text-slate-500">
                  <th className="rounded-l-xl px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() =>
                        setSortType((current) =>
                          current === "none" ? "asc" : current === "asc" ? "desc" : "none",
                        )
                      }
                      className="inline-flex items-center gap-1"
                    >
                      Type
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">Product & SKU</th>
                  <th className="px-4 py-3 font-medium">Movement Quantity</th>
                  <th className="px-4 py-3 font-medium">Previous Stock</th>
                  <th className="px-4 py-3 font-medium">New Stock</th>
                  <th className="px-4 py-3 font-medium">Operator / User</th>
                  <th className="rounded-r-xl px-4 py-3 font-medium">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-500">
                      No transactions match that filter.
                    </td>
                  </tr>
                ) : (
                  visible.map((item) => {
                    const incoming = item.type === "STOCK_IN";
                    const name = item.user?.name || "Unknown";

                    return (
                      <tr key={item.id} className="border-b border-line">
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              incoming
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {incoming ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {incoming ? "Stock In" : "Stock Out"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-950">
                            {item.product?.name || "Unknown product"}
                          </p>
                          {item.product?.sku ? (
                            <p className="mt-0.5 text-xs text-slate-400">{item.product.sku}</p>
                          ) : null}
                        </td>
                        <td
                          className={`px-4 py-4 text-sm font-bold ${
                            incoming ? "text-success" : "text-warning"
                          }`}
                        >
                          {incoming ? "+" : "−"}
                          {item.quantity.toLocaleString()} units
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <span className="font-semibold">{item.previousStock.toLocaleString()}</span>{" "}
                          <span className="text-slate-400">units</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <span className="font-semibold">{item.newStock.toLocaleString()}</span>{" "}
                          <span className="text-slate-400">units</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(name)}`}
                            >
                              {initials(name)}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-500">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-slate-400 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            {pageItems(currentPage, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
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
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-slate-400 disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
