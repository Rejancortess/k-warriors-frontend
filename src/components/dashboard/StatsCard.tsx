import type { ReactNode } from "react";
import { Minus, TrendingUp } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon,
  unit,
  trend,
  warning,
  note,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  unit?: string;
  trend?: string;
  warning?: string;
  note?: string;
}) => {
  const hasAlert = Boolean(warning || note);
  const alertActive = hasAlert && value > 0;
  const trendUp = value > 0;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{title}</p>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[18px] ${
            alertActive ? "bg-red-50 text-red-500" : "bg-slate-100 text-primary"
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <p className="text-4xl leading-none font-extrabold tracking-tight text-slate-950">
          {value.toLocaleString()}
        </p>
        {unit ? (
          <span className="mb-1 text-sm text-slate-400">{unit}</span>
        ) : null}
        {warning ? (
          <span
            className={`mb-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
              alertActive
                ? "bg-red-100 text-red-600"
                : "bg-emerald-50 text-primary"
            }`}
          >
            {warning}
          </span>
        ) : null}
      </div>

      {trend ? (
        <p
          className={`mt-4 flex items-center gap-1 text-sm font-medium ${
            trendUp ? "text-primary" : "text-slate-400"
          }`}
        >
          {trendUp ? (
            <TrendingUp className="size-4" />
          ) : (
            <Minus className="size-4" />
          )}
          {trend}
        </p>
      ) : null}

      {note ? (
        <p
          className={`mt-4 text-sm font-medium ${
            alertActive ? "text-red-500" : "text-primary"
          }`}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
};

export default StatsCard;
