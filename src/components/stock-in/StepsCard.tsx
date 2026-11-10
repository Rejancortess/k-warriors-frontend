const steps = [
  { title: "Scan Code", subtitle: "Hardware input" },
  { title: "Verify Code", subtitle: "Barcode Match" },
  { title: "Quantity", subtitle: "Set batch units" },
  { title: "Add Stock", subtitle: "Instant commit" },
];

export default function StepsCard({
  currentStep = 2,
}: {
  currentStep?: number;
}) {
  return (
    <section className="w-full rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-line">
      <ol className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const number = index + 1;
          const completed = number < currentStep;
          const current = number === currentStep;

          return (
            <li key={step.title} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  completed
                    ? "bg-primary text-white"
                    : current
                      ? "bg-success/15 text-primary"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {number}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm leading-tight font-semibold ${
                    completed
                      ? "text-primary"
                      : current
                        ? "text-slate-950"
                        : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{step.subtitle}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
