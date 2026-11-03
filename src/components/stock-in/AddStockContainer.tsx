import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  ClipboardList,
  LoaderCircle,
  Minus,
  Plus,
  ScanBarcode,
} from "lucide-react";
import axios from "axios";
import Toast from "../ui/Toast";
import { productService } from "../../services/product.service";
import { stockService } from "../../services/stock.service";

type ExistingProduct = {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  price: string | null;
};

type CodeStatus = "idle" | "available" | "exists";

export default function AddStockContainer() {
  const lookupId = useRef(0);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CodeStatus>("idle");
  const [existing, setExisting] = useState<ExistingProduct | null>(null);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minStock, setMinStock] = useState("");
  const [price, setPrice] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [toast, setToast] = useState("");

  const quantityValue = Number(quantity);
  const priceValue = price === "" ? Number.NaN : Number(price);
  const hasQuantity = quantity !== "" && quantityValue > 0;
  const hasPrice = price !== "" && !Number.isNaN(priceValue);
  const hasName = productName.trim() !== "";
  const hasMinStock = minStock !== "";
  const canRegister =
    status === "available" && hasName && hasQuantity && hasMinStock && hasPrice;
  const showMissing = attempted && !canRegister;
  const currentStock =
    status === "exists"
      ? (existing?.quantity ?? null)
      : status === "available"
        ? 0
        : null;
  const newTotal = status === "available" && hasQuantity ? quantityValue : null;
  const loading = lookingUp || submitting;

  useEffect(() => {
    if (canRegister && message === "Fill in all fields.") setMessage("");
  }, [canRegister, message]);

  function resetLookup() {
    lookupId.current += 1;
    setStatus("idle");
    setExisting(null);
    setLookingUp(false);
  }

  async function lookup(value: string) {
    const barcode = value.trim();
    const requestId = ++lookupId.current;

    if (!barcode) {
      setStatus("idle");
      setExisting(null);
      setLookingUp(false);
      return;
    }

    setLookingUp(true);
    setMessage("");
    setStatus("idle");
    setExisting(null);

    try {
      const response = await productService.getByBarcode(barcode);
      if (requestId !== lookupId.current) return;

      if (!response.data?.id) {
        setStatus("available");
        return;
      }

      setExisting({
        id: response.data.id,
        name: response.data.name,
        quantity: response.data.quantity,
        minStock: response.data.minStock,
        price: response.data.price,
      });
      setStatus("exists");
    } catch (error) {
      if (requestId !== lookupId.current) return;
      const missing =
        axios.isAxiosError(error) && error.response?.status === 404;
      setExisting(null);
      if (missing) {
        setStatus("available");
        return;
      }
      setMessage("Couldn't check that code. Try again.");
    } finally {
      if (requestId === lookupId.current) setLookingUp(false);
    }
  }

  function changeQuantity(next: number) {
    setQuantity(String(Math.max(1, next)));
  }

  function changeMinStock(next: number) {
    setMinStock(String(Math.max(0, next)));
  }

  function changePrice(value: string) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const [whole = "", fraction] = cleaned.split(".");
    const digits = whole.replace(/^0+(?=\d)/, "");
    setPrice(fraction === undefined ? digits : `${digits || "0"}.${fraction.slice(0, 2)}`);
  }

  function clearForm() {
    setCode("");
    setProductName("");
    setQuantity("");
    setMinStock("");
    setPrice("");
    setAttempted(false);
    setStatus("idle");
    setExisting(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || status === "exists") return;

    if (!canRegister) {
      setAttempted(true);
      setMessage("Fill in all fields.");
      return;
    }

    const barcode = code.trim();
    const name = productName.trim();
    setSubmitting(true);
    setMessage("");

    try {
      const created = await productService.create({
        name,
        sku: barcode,
        barcode,
        minStock: Number(minStock),
        price: priceValue,
      });

      try {
        await stockService.stockIn({
          productId: created.data.id,
          quantity: quantityValue,
          remarks: "Initial stock",
        });
      } catch {
        clearForm();
        setToast(name);
        setMessage("Product added, but the starting quantity couldn't be saved.");
        return;
      }

      clearForm();
      setToast(name);
    } catch (error) {
      const conflict =
        axios.isAxiosError(error) && error.response?.status === 409;
      if (conflict) {
        setStatus("exists");
        setMessage("This code is already registered.");
      } else {
        setMessage("Couldn't register this product. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    {toast ? <Toast message={toast} onClose={() => setToast("")} /> : null}
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7"
    >
      <div className="flex items-center gap-2">
        <label htmlFor="scan-code" className="text-base font-bold text-slate-950">
          Scan Product <span className="text-red-500">*</span>
        </label>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          Barcode or QR
        </span>
      </div>

      <div
        className={`mt-3 flex items-center gap-3 rounded-xl px-4 py-3 ${
          status === "exists" || (showMissing && status !== "available")
            ? "bg-red-50 ring-1 ring-red-200"
            : "bg-[#F4F6FB]"
        }`}
      >
        <ScanBarcode
          size={18}
          className={`shrink-0 ${status === "exists" ? "text-red-500" : "text-slate-500"}`}
        />
        <input
          id="scan-code"
          value={code}
          disabled={loading}
          aria-invalid={status === "exists" || (showMissing && status !== "available")}
          onChange={(event) => {
            setCode(event.target.value);
            resetLookup();
            setMessage("");
          }}
          onBlur={() => {
            if (code.trim()) void lookup(code);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void lookup(code);
            }
          }}
          placeholder="Scan or enter a code"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
        {lookingUp ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Checking...
          </span>
        ) : status === "available" ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary">
            <CircleCheck size={16} />
            New product
          </span>
        ) : status === "exists" ? (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-red-600"
            role="status"
          >
            <CircleX size={16} />
            Already registered
          </span>
        ) : null}
      </div>

      <label htmlFor="product-name" className="mt-6 block text-base font-bold text-slate-950">
        Product Name <span className="text-red-500">*</span>
      </label>
      {status === "available" ? (
        <input
          id="product-name"
          value={productName}
          disabled={loading}
          onChange={(event) => setProductName(event.target.value)}
          placeholder="Product name"
          aria-invalid={showMissing && !hasName}
          className={`mt-3 w-full rounded-xl px-4 py-4 text-lg font-bold text-slate-950 outline-none placeholder:font-bold placeholder:text-slate-400 disabled:opacity-60 ${
            showMissing && !hasName ? "bg-red-50 ring-1 ring-red-200" : "bg-[#F4F6FB]"
          }`}
        />
      ) : (
        <div
          id="product-name"
        className={`mt-3 rounded-xl px-4 py-4 text-lg font-bold ${
          lookingUp
            ? "animate-pulse bg-[#F4F6FB] text-slate-300"
            : status === "exists" || showMissing
              ? "bg-red-50 text-red-600 ring-1 ring-red-200"
              : "bg-[#F4F6FB] text-slate-400"
        }`}
        >
          {lookingUp
            ? "Looking up product..."
            : status === "exists"
              ? existing?.name || "Already registered"
              : "Product name"}
        </div>
      )}

      <div className="mt-6 flex items-end justify-between gap-3">
        <label htmlFor="quantity" className="text-base font-bold text-slate-950">
          Enter Quantity <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-slate-400">Units count</span>
      </div>

      <div
        className={`mt-3 flex items-center gap-3 rounded-xl p-2 ${
          showMissing && !hasQuantity ? "bg-red-50 ring-1 ring-red-200" : "bg-[#F4F6FB]"
        }`}
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={loading || status === "exists"}
          onClick={() => changeQuantity((quantityValue || 1) - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-50"
        >
          <Minus size={18} />
        </button>
        <input
          id="quantity"
          inputMode="numeric"
          value={quantity}
          disabled={loading || status === "exists"}
          onChange={(event) => {
            const next = event.target.value.replace(/\D/g, "");
            setQuantity(next);
          }}
          aria-invalid={showMissing && !hasQuantity}
          placeholder="0"
          className="w-full bg-transparent text-center text-4xl font-extrabold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 disabled:opacity-60"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={loading || status === "exists"}
          onClick={() => changeQuantity((quantityValue || 0) + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <label htmlFor="min-stock" className="text-base font-bold text-slate-950">
          Minimum Stock <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-slate-400">Low stock alert</span>
      </div>

      <div
        className={`mt-3 flex items-center gap-3 rounded-xl p-2 ${
          showMissing && !hasMinStock ? "bg-red-50 ring-1 ring-red-200" : "bg-[#F4F6FB]"
        }`}
      >
        <button
          type="button"
          aria-label="Decrease minimum stock"
          disabled={loading || status === "exists"}
          onClick={() => changeMinStock((Number(minStock) || 0) - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-50"
        >
          <Minus size={18} />
        </button>
        <input
          id="min-stock"
          inputMode="numeric"
          value={status === "exists" ? String(existing?.minStock ?? "") : minStock}
          disabled={loading || status === "exists"}
          onChange={(event) => {
            setMinStock(event.target.value.replace(/\D/g, ""));
          }}
          aria-invalid={showMissing && !hasMinStock}
          placeholder="0"
          className="w-full bg-transparent text-center text-4xl font-extrabold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 disabled:opacity-60"
        />
        <button
          type="button"
          aria-label="Increase minimum stock"
          disabled={loading || status === "exists"}
          onClick={() => changeMinStock((Number(minStock) || 0) + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl text-slate-700 shadow-sm ring-1 ring-slate-100 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <label htmlFor="price" className="text-base font-bold text-slate-950">
          Price <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-slate-400">Per unit</span>
      </div>

      <div
        className={`mt-3 flex items-center gap-3 rounded-xl px-4 py-3 ${
          showMissing && !hasPrice ? "bg-red-50 ring-1 ring-red-200" : "bg-[#F4F6FB]"
        }`}
      >
        <span className="text-lg font-bold text-slate-400">₱</span>
        <input
          id="price"
          inputMode="decimal"
          value={status === "exists" ? (existing?.price ?? "") : price}
          disabled={loading || status === "exists"}
          onChange={(event) => changePrice(event.target.value)}
          aria-invalid={showMissing && !hasPrice}
          placeholder="0.00"
          className="w-full bg-transparent text-center text-4xl font-extrabold tracking-tight text-slate-950 outline-none placeholder:text-slate-300 disabled:opacity-60"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F4F6FB] px-4 py-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <ClipboardList size={16} className="text-slate-400" />
          Current in stock:{" "}
          <strong className="font-bold text-slate-950">
            {currentStock === null ? "—" : `${currentStock} units`}
          </strong>
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-primary">
          <ArrowRight size={16} />
          New total:{" "}
          <strong className="font-bold">
            {newTotal === null ? "—" : `${newTotal} units`}
          </strong>
        </span>
      </div>

      <button
        type="submit"
        disabled={loading || status === "exists"}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-4 text-white transition hover:bg-[#00593c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="inline-flex items-center gap-2 text-base font-semibold">
          {submitting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded border border-white/70">
              <Plus size={12} />
            </span>
          )}
          {submitting ? "Registering..." : "+ Register Product"}
        </span>
        <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-medium">
          Enter ↵
        </span>
      </button>

      {message ? (
        <p className="mt-3 text-sm text-red-600" role="status">
          {message}
        </p>
      ) : null}
    </form>
    </>
  );
}
