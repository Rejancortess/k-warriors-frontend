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
      <section className="flex flex-col  p-6 ">
        <div className=" flex justify-between items-center mb-10">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link
            to="/stock-in"
            className="flex items-center gap-2 text-sm hover:bg-primary/80 transition-colors duration-300 text-white bg-primary px-4 py-2 rounded-xl"
          >
            <Plus />
            New Stock Entries
          </Link>
        </div>
        {loading && !stats ? (
          <p className="mb-6 text-sm text-slate-500">Loading dashboard...</p>
        ) : null}
        {error && !stats ? (
          <p className="mb-6 text-sm text-red-600">{error}</p>
        ) : null}
        {stats ? (
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
