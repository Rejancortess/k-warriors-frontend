import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, LoaderCircle, Minus, Plus } from "lucide-react";
import axios from "axios";

import Toast from "../ui/Toast";
import { stockService } from "../../services/stock.service";
import type { Product } from "../../types/product.types";

function barsFor(value: string) {
  const bits = [1, 0, 1];

  for (const char of value) {
    const code = char.charCodeAt(0);
    bits.push(1, code & 1, (code >> 1) & 1, (code >> 2) & 1, 0);
  }

  bits.push(1, 0, 1);
  return bits;
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }

  return fallback;
}

type ScannedProductCardProps = {
  product: Product | null;
  barcode: string;
  lookingUp: boolean;
  error: string;
  onUpdated: (product: Product) => void;
};

const ScannedProductCard = ({
  product,
  barcode,
  lookingUp,
  error,
  onUpdated,
}: ScannedProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState<"in" | "out" | null>(null);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setQuantity(1);
    setMessage("");
  }, [product?.id]);

  async function moveStock(type: "in" | "out") {
    if (!product || submitting) return;

    if (type === "out" && quantity > product.quantity) {
      setMessage("Not enough stock.");
      return;
    }

    setSubmitting(type);
    setMessage("");

    try {
      const payload = {
        productId: product.id,
        quantity,
        remarks: type === "in" ? "Scanned stock in" : "Scanned stock out",
      };
      const response =
        type === "in"
          ? await stockService.stockIn(payload)
          : await stockService.stockOut(payload);
      const next = { ...product, quantity: response.data.newStock };
      onUpdated(next);
      setQuantity(1);
      setToast(
        `${product.name} now has ${next.quantity.toLocaleString()} units`,
      );
    } catch (moveError) {
      setMessage(errorMessage(moveError, "Couldn't update the stock."));
    } finally {
      setSubmitting(null);
    }
  }

  const low = product ? product.quantity < product.minStock : false;
  const code = product?.barcode || product?.sku || barcode.trim() || "Barcode";
  const ready = Boolean(product);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-line">
      <div className="flex items-center justify-between gap-3">
        <h2
          className={`text-2xl font-bold tracking-tight ${
            ready ? "text-slate-950" : "text-slate-300"
          }`}
        >
          {product?.name ?? "Product name"}
        </h2>
        {lookingUp ? (
          <LoaderCircle size={16} className="animate-spin text-slate-400" />
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-warning" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-2xl bg-canvas px-6 py-5">
        <div className="flex h-16 items-stretch justify-center gap-px">
          {barsFor(code).map((filled, index) => (
            <span
              key={`${code}-${index}`}
              className={
                filled
                  ? `w-0.5 ${ready ? "bg-slate-950" : "bg-slate-300"}`
                  : "w-px bg-transparent"
              }
            />
          ))}
        </div>
        <p
          className={`mt-3 text-center text-sm tracking-[0.18em] ${
            ready || barcode.trim() ? "text-slate-500" : "text-slate-300"
          }`}
        >
          {code}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-canvas px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Available Warehouse Stock</p>
          {product && low ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              {product.quantity === 0 ? "Out of Stock" : "Low Stock Alert"}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-slate-950">
          <span
            className={`text-5xl font-bold tracking-tight ${
              ready ? "text-slate-950" : "text-slate-300"
            }`}
          >
            {product ? product.quantity.toLocaleString() : "—"}
          </span>{" "}
          <span className="text-lg text-slate-400">units</span>
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={!ready}
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40"
        >
          <Minus size={16} />
        </button>
        <div className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-800">
          {quantity}
        </div>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={!ready}
          onClick={() => setQuantity((current) => current + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!ready || submitting !== null}
          onClick={() => void moveStock("in")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          <ArrowDownToLine size={16} />
          {submitting === "in" ? "Saving..." : "Stock In"}
        </button>
        <button
          type="button"
          disabled={!product || submitting !== null || product.quantity === 0}
          onClick={() => void moveStock("out")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-warning/30 bg-white px-4 py-3 text-sm font-semibold text-warning disabled:opacity-70"
        >
          <ArrowUpFromLine size={16} />
          {submitting === "out" ? "Saving..." : "Stock Out"}
        </button>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-warning" role="alert">
          {message}
        </p>
      ) : null}

      {toast ? (
        <Toast title="Stock updated" message={toast} onClose={() => setToast("")} />
      ) : null}
    </section>
  );
};

export default ScannedProductCard;
