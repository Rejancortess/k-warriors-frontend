import { Plus, Box, Layers, TriangleAlert, ArrowLeftRight } from "lucide-react";
import StatsCard from "../../components/dashboard/StatsCard";
import { useDashboardStore } from "../../stores/useDashboardStore";
import { useEffect } from "react";
import RecentTransactionCard from "../../components/dashboard/RecentTransactionCard";
import LowStockCard from "../../components/dashboard/LowStockCard";
import { Link } from "react-router-dom";

const productTrend = (count: number) => {
  if (count === 0) return "No products yet";
  const label = count === 1 ? "product" : "products";
  return `${count.toLocaleString()} ${label} in the catalog`;
};

const transactionTrend = (count: number) => {
  if (count === 0) return "No transactions today";
  return `${count.toLocaleString()} recorded today`;
};

const lowStockNote = (count: number) => {
  if (count === 0) return "No action needed";
  if (count === 1) return "1 product requires attention";
  return `${count.toLocaleString()} products require attention`;
};

const StatsCardSkeleton = () => (
  <div
    className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-line"
    aria-hidden="true"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
    </div>
    <div className="mt-5 h-9 w-20 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 h-4 w-36 animate-pulse rounded bg-slate-200" />
  </div>
);

const Dasboard = () => {
  const stats = useDashboardStore((state) => state.stats);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const fetchStats = useDashboardStore((state) => state.fetchStats);
  const totalProducts = stats?.totalProducts ?? 0;
  const totalStock = stats?.totalStock ?? 0;
  const lowStock = stats?.lowStock ?? 0;
  const todayTransactions = stats?.todayTransactions ?? 0;
  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <>
      <section className="flex flex-col p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link
            to="/stock-in"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-white transition-colors duration-300 hover:bg-primary-hover"
          >
            <Plus />
            New Stock Entries
          </Link>
        </div>
        {error && !stats ? (
          <p className="mb-6 text-sm text-warning">{error}</p>
        ) : null}
        {loading && !stats ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            aria-busy="true"
            aria-label="Loading dashboard"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <StatsCardSkeleton key={index} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard
              title="Total Products"
              value={totalProducts}
              icon={<Box />}
              trend={productTrend(totalProducts)}
            />
            <StatsCard
              title="Total Stock"
              value={totalStock}
              icon={<Layers />}
              unit="units"
            />
            <StatsCard
              title="Low Stock"
              value={lowStock}
              icon={<TriangleAlert />}
              warning={lowStock > 0 ? "WARNING" : "CLEAR"}
              note={lowStockNote(lowStock)}
            />
            <StatsCard
              title="Today's Transactions"
              value={todayTransactions}
              icon={<ArrowLeftRight />}
              trend={transactionTrend(todayTransactions)}
            />
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <RecentTransactionCard />
          </div>
          <div className="w-full lg:w-[380px] lg:shrink-0">
            <LowStockCard />
          </div>
        </div>
      </section>
    </>
  );
};

export default Dasboard;
