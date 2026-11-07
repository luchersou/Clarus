import Link from "next/link";
import { ArrowRight, Check, FileCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "../reveal";

const VALUES = [
  { field: "Total amount", value: "$48,750.00" },
  { field: "Due date", value: "Oct 15, 2027" },
  { field: "Late fee", value: "2% per month" },
];

const ASSURANCES = [
  { label: "No credit card required", icon: Check },
  { label: "AES-256 encrypted", icon: Lock },
];

export function CTA() {
  return (
    <section id="cta" className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-20">
      <Reveal y={40}>
        {/* The card is always dark, so it uses the brighter brand green */}
        <div className="bg-noise notched-card relative overflow-hidden rounded-2xl bg-zinc-950 text-white [--primary-foreground:oklch(0.2_0.03_155)] [--primary:oklch(0.76_0.16_155)]">
          <div className="pointer-events-none absolute -right-40 -top-40 size-[640px] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_20%,transparent),transparent)]" />

          <div className="relative grid items-center gap-12 px-6 py-14 md:px-14 md:py-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-white/70">
                <span className="size-1.5 rounded-full bg-primary" />
                Ready when you are
              </p>

              <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
                Stop reading what Clarus can read for you.
              </h2>

              <p className="mt-5 max-w-md text-pretty leading-relaxed text-white/70 md:text-lg">
                Upload your first document and get a structured answer — no
                setup, no configuration.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className="group h-11 gap-2 px-5"
                >
                  Get started for free
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/#how-it-works" />}
                  className="h-11 px-4 hover:bg-white/10 hover:text-white"
                >
                  See how it works
                </Button>
              </div>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
                {ASSURANCES.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="size-3.5 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10 md:block">
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
                    <Reveal
                      key={field}
                      y={12}
                      delay={0.3 + index * 0.1}
                      className="flex items-center gap-2 px-4 py-3"
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[9px] font-semibold text-primary">
                        {index + 1}
                      </span>

                      <span className="text-sm text-white/60">{field}</span>

                      <span className="ml-auto whitespace-nowrap font-mono text-sm">
                        {value}
                      </span>
                    </Reveal>
                  ))}
                </div>

                <p className="flex items-center gap-1.5 border-t border-white/10 px-4 py-3 text-[11px] text-white/60">
                  <Check className="size-3 text-primary" />
                  Traced to page 4, clause 3
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
