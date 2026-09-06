import Link from "next/link";
import { ArrowRight, FileCheck } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="w-full max-w-6xl mx-auto px-4 py-12 md:py-24 relative z-20">
      <div className="relative group rounded-2xl md:rounded-4xl overflow-hidden bg-zinc-950 border-2 border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10">

        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-3xl pointer-events-none transition-bg duration-500 group-hover:bg-primary/30" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-8 py-12 md:p-16 gap-16">
          {/* Left content */}
          <div className="flex-1 flex flex-col items-start text-left w-full max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/70 font-medium">
                Ready when you are
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 tracking-tight leading-tight">
              Stop reading <br className="hidden md:block" /> what Clarus can read for you.
            </h2>

            <p className="text-sm md:text-lg text-white/50 mb-10 md:mb-12 font-light leading-relaxed">
              Upload your first document and see a structured answer in seconds — no setup, no configuration.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/sign-up"
                className="group relative inline-flex w-full sm:w-auto h-10 md:h-12 items-center justify-center gap-3 rounded-full bg-white hover:bg-white/90 px-8 text-sm font-medium text-black"
              >
                <span>Get started for free</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-full border border-white/20" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex w-full sm:w-auto h-10 md:h-12 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 px-8 text-sm font-medium text-white transition-all hover:bg-white/[0.08]"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-white/30 text-xs font-light">
              <div className="flex items-center gap-2">
                <svg className="size-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="size-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                AES-256 encrypted
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="flex-1 w-full relative hidden md:block">
            <div className="absolute inset-0 bg-primary/[0.03] blur-3xl rounded-full" />
            <div className="relative rounded-2xl border-2 border-white/5 bg-black/60 backdrop-blur-xl p-6 shadow-2xl overflow-hidden group-hover:-translate-y-2 transition-transform duration-700">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/10 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-white font-medium mb-1 tracking-wide">
                      Supplier_Contract.pdf
                    </div>
                    <div className="text-xs text-primary flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Processed
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50 tracking-widest uppercase">
                  Clarus
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { field: "Total amount", value: "$4,820.00" },
                  { field: "Due date", value: "Oct 15, 2026" },
                  { field: "Late fee", value: "2% per month" },
                ].map(({ field, value }) => (
                  <div
                    key={field}
                    className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm text-white/50 font-light">{field}</span>
                    <span className="text-sm text-white font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}