import { Check, FileCheck, Lock, ShieldCheck } from "lucide-react";

// Same sample contract as the landing page
const VALUES = [
  { field: "Total amount", value: "$48,750.00" },
  { field: "Due date", value: "Oct 15, 2027" },
  { field: "Late fee", value: "2% per month" },
];

const ASSURANCES = [
  { label: "AES-256 encrypted", icon: Lock },
  { label: "Values traced to their page", icon: ShieldCheck },
];

export function ProductPanel() {
  return (
    // The panel is always dark, so it uses the brighter brand green
    <div className="bg-noise notched-card relative flex h-full flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white [--primary-foreground:oklch(0.2_0.03_155)] [--primary:oklch(0.76_0.16_155)] xl:p-14">
      <div className="pointer-events-none absolute -right-40 -top-40 size-[640px] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_20%,transparent),transparent)]" />

      <div className="relative max-w-md">
        <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/70">
          <span className="size-1.5 rounded-full bg-primary" />
          Document analysis with AI
        </p>

        <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-tight xl:text-4xl">
          Precise answers from your contracts and invoices.
        </h2>
      </div>

      <div className="relative mx-auto w-full max-w-md rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
        <div className="overflow-hidden rounded-lg bg-black/60 ring-1 ring-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileCheck className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                Supplier_Contract_2026.pdf
              </p>
              <p className="text-xs text-primary">Processed</p>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {VALUES.map(({ field, value }, index) => (
              <div
                key={field}
                className="flex animate-in fade-in slide-in-from-bottom-2 fill-mode-both items-center gap-2 px-4 py-3 duration-700 motion-reduce:animate-none"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[9px] font-semibold text-primary">
                  {index + 1}
                </span>

                <span className="text-sm text-white/60">{field}</span>

                <span className="ml-auto whitespace-nowrap font-mono text-sm">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1.5 border-t border-white/10 px-4 py-3 text-[11px] text-white/60">
            <Check className="size-3 text-primary" />
            Traced to page 4, clause 3
          </p>
        </div>
      </div>

      <ul className="relative flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
        {ASSURANCES.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-2">
            <Icon className="size-3.5 text-primary" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
