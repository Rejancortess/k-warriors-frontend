import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  LoaderCircle,
  Package,
  PackageMinus,
  PackagePlus,
} from "lucide-react";

import { productService } from "../../services/product.service";
import { transactionService } from "../../services/transaction.service";

type Filter = "all" | "unread" | "alerts";

type Notice = {
  id: string;
  title: string;
  body: string;
  time: string;
  createdAt: number;
  alert: boolean;
  tone: "low" | "restock" | "in" | "out";
  href: string;
};

function formatAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes === 1 ? "1 min ago" : `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function NoticeIcon({ tone }: { tone: Notice["tone"] }) {
  if (tone === "low") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
        <AlertTriangle size={18} />
      </span>
    );
  }

  if (tone === "restock") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Package size={18} />
      </span>
    );
  }

  if (tone === "in") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
        <PackagePlus size={18} />
      </span>
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
      <PackageMinus size={18} />
    </span>
  );
}

type NotificationMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NotificationMenu({ open, onOpenChange }: NotificationMenuProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  const loadedRef = useRef(false);
  onOpenChangeRef.current = onOpenChange;
  const [filter, setFilter] = useState<Filter>("all");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        onOpenChangeRef.current(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open && loadedRef.current) return;
    loadedRef.current = true;
    let active = true;

    Promise.all([
      productService.getLowStock(),
      transactionService.getAll({ limit: 6 }),
    ])
      .then(([stock, history]) => {
        if (!active) return;

        const alerts: Notice[] = (stock.data ?? []).map((product) => {
          const out = product.quantity === 0;
          return {
            id: `stock-${product.id}`,
            title: out
              ? `${product.name} needs restocking`
              : `${product.name} is running low`,
            body: out
              ? `0 units remaining. Minimum stock: ${product.minStock}.`
              : `Only ${product.quantity.toLocaleString()} units remaining. Minimum stock: ${product.minStock}.`,
            time: formatAgo(product.updatedAt),
            createdAt: new Date(product.updatedAt).getTime() || 0,
            alert: true,
            tone: out ? "restock" : "low",
            href: `/inventory?q=${encodeURIComponent(product.name)}`,
          };
        });

        const movements: Notice[] = (history.data ?? []).map((item) => {
          const name = item.product?.name || "a product";
          const incoming = item.type === "STOCK_IN";
          return {
            id: `tx-${item.id}`,
            title: incoming ? "Stock In completed" : "Stock Out completed",
            body: incoming
              ? `${item.quantity.toLocaleString()} units added to ${name}.`
              : `${item.quantity.toLocaleString()} units removed from ${name}.`,
            time: formatAgo(item.createdAt),
            createdAt: new Date(item.createdAt).getTime() || 0,
            alert: false,
            tone: incoming ? "in" : "out",
            href: "/transactions",
          };
        });

        setNotices(
          [...alerts, ...movements].sort((a, b) => b.createdAt - a.createdAt),
        );
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load notifications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const unread = notices.filter((notice) => !readIds.has(notice.id));
  const visible = notices.filter((notice) => {
    if (filter === "unread") return !readIds.has(notice.id);
    if (filter === "alerts") return notice.alert;
    return true;
  });

  function markAllRead() {
    setReadIds(new Set(notices.map((notice) => notice.id)));
  }

  function openNotice(notice: Notice) {
    setReadIds((current) => new Set(current).add(notice.id));
    onOpenChange(false);
    navigate(notice.href);
  }

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "alerts", label: "Stock Alerts" },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
        className="relative text-muted hover:text-primary"
      >
        <Bell size={22} />
        {unread.length > 0 ? (
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-semibold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-[4.25rem] z-40 flex max-h-[min(32rem,calc(100dvh-6rem))] flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-xl sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-3 sm:w-[22rem] sm:max-h-none"
        >
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Notifications</h2>
              {unread.length > 0 ? (
                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                  {unread.length} new
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Stay updated on your inventory</p>
              <button
                type="button"
                onClick={markAllRead}
                disabled={unread.length === 0}
                className="shrink-0 text-sm font-semibold text-link disabled:opacity-40"
              >
                Mark all as read
              </button>
            </div>

            <div className="mt-4 flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    filter === tab.id
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto">
            {loading ? (
              <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Loading notifications...
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-warning">{error}</p>
            ) : visible.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">You're all caught up.</p>
            ) : (
              <ul>
                {visible.map((notice) => {
                  const isUnread = !readIds.has(notice.id);
                  return (
                    <li key={notice.id} className="border-t border-line">
                      <button
                        type="button"
                        onClick={() => openNotice(notice)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <NoticeIcon tone={notice.tone} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{notice.title}</span>
                          <span className="mt-0.5 block text-sm text-slate-500">
                            {notice.body}
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">
                            {notice.time}
                          </span>
                        </span>
                        {isUnread ? (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        ) : (
                          <span className="mt-1.5 h-2 w-2 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-3">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread.length === 0}
              className="w-full rounded-full border border-line py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40"
            >
              Mark all as read
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
