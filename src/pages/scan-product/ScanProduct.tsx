import { useEffect, useRef, useState } from "react";
import axios from "axios";

import CameraScanner from "../../components/scan-products/CameraScanner";
import ScannedProductCard from "../../components/scan-products/ScannedProductCard";
import { productService } from "../../services/product.service";
import type { Product } from "../../types/product.types";

const ScanProduct = () => {
  const lookupId = useRef(0);
  const [barcode, setBarcode] = useState("");
  const [retry, setRetry] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");

  function updateBarcode(value: string) {
    setBarcode(value);
    if (value.trim() !== (product?.barcode ?? "").trim()) {
      setProduct(null);
      setLookupError("");
    }
  }

  function submitBarcode(code: string) {
    const trimmed = code.trim();
    if (trimmed === barcode.trim()) {
      setRetry((current) => current + 1);
      return;
    }
    setProduct(null);
    setLookupError("");
    setBarcode(trimmed);
  }

  useEffect(() => {
    const trimmed = barcode.trim();

    if (!trimmed) {
      lookupId.current += 1;
      setLookingUp(false);
      setLookupError("");
      setProduct(null);
      return;
    }

    const id = ++lookupId.current;
    const timer = window.setTimeout(() => {
      setLookingUp(true);
      setLookupError("");

      productService
        .getByBarcode(trimmed)
        .then((response) => {
          if (lookupId.current !== id) return;
          setProduct(response.data);
        })
        .catch((error: unknown) => {
          if (lookupId.current !== id) return;
          setProduct(null);
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setLookupError("No product matches this barcode.");
          } else {
            setLookupError("Couldn't look up that barcode.");
          }
        })
        .finally(() => {
          if (lookupId.current === id) setLookingUp(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [barcode, retry]);

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-slate-950">Scan Product</h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <CameraScanner
          barcode={barcode}
          onBarcodeChange={updateBarcode}
          onLookup={submitBarcode}
        />
        <ScannedProductCard
          product={product}
          barcode={barcode}
          lookingUp={lookingUp}
          error={lookupError}
          onUpdated={setProduct}
        />
      </div>
    </section>
  );
};

export default ScanProduct;
