import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, X } from "lucide-react";

export default function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = window.setTimeout(() => onCloseRef.current(), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  return createPortal(
    <div
      role="status"
      className="animate-toast-in fixed top-20 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl bg-white py-3 pr-3 pl-4 shadow-lg ring-1 ring-slate-200"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary">
        <CircleCheck size={18} />
      </span>
      <div className="min-w-0 pr-1">
        <p className="text-sm font-semibold text-slate-950">New product added</p>
        <p className="truncate text-sm text-slate-500">{message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={16} />
      </button>
    </div>,
    document.body,
  );
}
