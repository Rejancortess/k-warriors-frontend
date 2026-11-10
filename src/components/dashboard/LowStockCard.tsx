import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

export default function LowStockCard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    productService
      .getLowStock()
      .then((response) => {
        if (!active) return;
        setProducts(response.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setError("Couldn't load low stock.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const criticalCount = products.length;

  return (
    <section className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            Low Stock
          </h2>
          {criticalCount > 0 ? (
            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
              {criticalCount} critical
            </span>
          ) : null}
        </div>
        <Link to="/inventory" className="text-sm font-semibold text-link">
          See All
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle size={16} className="animate-spin" />
          Loading low stock...
        </p>
      ) : error ? (
        <p className="mt-6 text-sm text-warning">{error}</p>
      ) : products.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No low stock products.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-6">
          {products.map((product) => {
            const ratio =
              product.minStock > 0
                ? Math.min(product.quantity / product.minStock, 1)
                : 0;
            const belowMin = product.quantity < product.minStock;

            return (
              <li key={product.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{product.name}</p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {product.quantity} left / Min: {product.minStock}
                    </p>
                  </div>
                  <Link
                    to="/stock-in"
                    className="shrink-0 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
                  >
                    Restock
                  </Link>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      belowMin ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${Math.max(ratio * 100, 4)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
