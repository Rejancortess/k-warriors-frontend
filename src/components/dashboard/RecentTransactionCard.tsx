import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { transactionService } from "../../services/transaction.service";
import type { TransactionListItem } from "../../types/stock.types";

function shortId(id: string) {
  return id.length > 6 ? id.slice(-4) : id;
}

function formatTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const columns =
  "grid grid-cols-[4.5rem_minmax(0,1.4fr)_6.5rem_5rem_4rem_4.5rem] items-center gap-4";

export default function RecentTransactionCard() {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    transactionService
      .getAll({ limit: 5 })
      .then((response) => {
        if (!active) return;
        setTransactions(response.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load transactions.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-slate-950">
          Recent Transactions
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink"
          >
            All
          </button>
          <Link
            to="/transactions"
            className="text-sm font-semibold text-link"
          >
            View All &gt;
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[640px]">
          <div
            className={`${columns} rounded-xl bg-canvas px-4 py-3 text-sm text-slate-400`}
          >
            <span>ID</span>
            <span>Product</span>
            <span>Type</span>
            <span>Quantity</span>
            <span>Time</span>
            <span>Status</span>
          </div>

          <div>
            {loading ? (
              <p className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                Loading transactions...
              </p>
            ) : error ? (
              <p className="px-4 py-8 text-sm text-warning">{error}</p>
            ) : transactions.length === 0 ? (
              <p className="px-4 py-8 text-sm text-slate-500">
                No transactions yet.
              </p>
            ) : (
              transactions.map((transaction) => {
                const stockIn = transaction.type === "STOCK_IN";

                return (
                  <div
                    key={transaction.id}
                    className={`${columns} border-b border-line px-4 py-5 last:border-b-0`}
                  >
                    <span
                      className="max-w-16 text-sm leading-tight text-slate-400"
                      title={transaction.id}
                    >
                      #TX-{shortId(transaction.id)}
                    </span>
                    <span className="truncate font-bold text-slate-900">
                      {transaction.product?.name ?? "Unknown product"}
                    </span>
                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs leading-tight font-semibold ${
                        stockIn
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {stockIn ? (
                        <ArrowDown className="size-3.5" />
                      ) : (
                        <ArrowUp className="size-3.5" />
                      )}
                      <span>
                        Stock
                        {stockIn ? "In" : "Out"}
                      </span>
                    </span>
                    <span
                      className={`text-sm leading-tight font-bold ${
                        stockIn ? "text-success" : "text-ink"
                      }`}
                    >
                      {stockIn ? "+" : "-"}
                      {transaction.quantity}
                      <span className="text-xs">units</span>
                    </span>
                    <span className="max-w-14 text-sm leading-tight text-slate-400">
                      {formatTime(transaction.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <span className="size-2 rounded-full bg-success" />
                      Done
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
