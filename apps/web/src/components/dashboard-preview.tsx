"use client";

import { useEffect, useRef } from "react";
import {
  Home,
  FileText,
  BarChart3,
  GitCompare,
  Settings,
  CheckCircle2,
  Clock3,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, active: true },
  { label: "Documents", icon: FileText },
  { label: "Analytics", icon: BarChart3 },
  { label: "Comparisons", icon: GitCompare },
];

const ACTIONS = [
  { label: "Summary", active: false },
  { label: "Value extraction", active: true },
  { label: "Due date check", active: false },
  { label: "Comparison", active: false },
];

const EXTRACTED_VALUES = [
  { field: "Total amount", value: "$ 48,750.00" },
  { field: "Due date", value: "10/15/2026" },
  { field: "Late fee", value: "2% per month" },
];

const METRICS = [
  {
    label: "Documents processed",
    value: "1,284",
    change: "+12.8%",
    icon: FileText,
  },
  {
    label: "Values extracted",
    value: "8,492",
    change: "+18.4%",
    icon: Sparkles,
  },
  {
    label: "Avg. processing time",
    value: "2.4s",
    change: "-31.2%",
    icon: Zap,
  },
];

export function DashboardPreview() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dashboard = dashboardRef.current;

    if (!dashboard) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = dashboard.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Normalizes position between -1 and 1
      const normalizedX = (x / rect.width - 0.5) * 2;
      const normalizedY = (y / rect.height - 0.5) * 2;

      // Maximum tilt intensity
      const maxTilt = 3;

      const rotateY = normalizedX * maxTilt;
      const rotateX = -normalizedY * maxTilt;

      dashboard.style.transform = `
        perspective(1800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.01, 1.01, 1.01)
      `;
    };

    const handleMouseLeave = () => {
      dashboard.style.transform = `
        perspective(1800px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
    };

    dashboard.addEventListener("mousemove", handleMouseMove);
    dashboard.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      dashboard.removeEventListener("mousemove", handleMouseMove);
      dashboard.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="hidden sm:block relative w-full max-w-6xl mx-auto px-4 py-24">
      {/* Ambient glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-20
          -translate-x-1/2
          w-[70%]
          h-[420px]
          rounded-full
          bg-primary/5
          blur-[100px]
        "
      />

      {/* Dashboard container */}
      <div className="relative">
        {/* Interactive dashboard */}
        <div
          ref={dashboardRef}
          className="
            relative
            rounded-2xl
            border
            border-border
            bg-card
            overflow-hidden
            shadow-[0_30px_80px_-25px_rgba(0,0,0,0.30)]
            will-change-transform
          "
          style={{
            transform:
              "perspective(1800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: "transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Browser top bar */}
          <div className="flex items-center px-6 py-4 border-b border-border bg-muted/40">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="mx-auto flex items-center gap-2 px-4 py-1.5 rounded-md bg-background border border-border">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />

              <span className="text-[10px] text-muted-foreground tracking-widest font-mono">
                app.clarus.com/dashboard
              </span>
            </div>
          </div>

          {/* Dashboard */}
          <div className="flex min-h-[680px] bg-background">
            {/* Sidebar */}
            <div className="hidden md:flex w-56 shrink-0 border-r border-border flex-col py-6 px-3 bg-muted/20">
              <div className="px-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="size-3.5" />
                  </div>

                  <span className="text-lg font-semibold tracking-tight">
                    Clarus
                  </span>
                </div>
              </div>

              <div className="space-y-1 flex-1">
                {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
                  <div
                    key={label}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 mr-3" />

                    {label}

                    {label === "Documents" && (
                      <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        12
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 px-3">
                <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <Settings className="size-4 mr-3" />
                  Settings
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="flex-1 min-w-0 p-7">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      Document intelligence
                    </p>

                    <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                      <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    AI-powered document analysis
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  Secure processing
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {METRICS.map(({ label, value, change, icon: Icon }) => (
                  <div
                    key={label}
                    className="
                      rounded-xl
                      border
                      border-border
                      bg-card
                      p-4
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center justify-center size-7 rounded-lg bg-muted">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </div>

                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                        {change}
                      </span>
                    </div>

                    <p className="text-lg font-semibold tracking-tight">
                      {value}
                    </p>

                    <p className="text-[10px] text-muted-foreground mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Document header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium">
                    Supplier_Contract_2026.pdf
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Processed 2 minutes ago
                    </p>

                    <span className="text-muted-foreground">•</span>

                    <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                      <CheckCircle2 className="size-3" />
                      Analysis complete
                    </div>
                  </div>
                </div>

                <button className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  View document
                  <ArrowUpRight className="size-3" />
                </button>
              </div>

              {/* Action pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ACTIONS.map(({ label, active }) => (
                  <div
                    key={label}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-300 cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground border border-border hover:bg-muted"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Analysis area */}
              <div className="grid grid-cols-2 gap-4">
                {/* Document preview */}
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-muted-foreground" />

                      <span className="text-xs font-medium">
                        Contract preview
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-mono">
                      PAGE 04
                    </span>
                  </div>

                  <div className="relative h-[190px] p-5 bg-muted/20 overflow-hidden">
                    <div className="relative h-full rounded-md bg-background border border-border p-4 shadow-sm">
                      <div className="w-24 h-2 rounded bg-foreground/80 mb-4" />

                      <div className="space-y-2">
                        <div className="w-full h-1.5 rounded bg-muted" />
                        <div className="w-[92%] h-1.5 rounded bg-muted" />
                        <div className="w-[80%] h-1.5 rounded bg-muted" />
                      </div>

                      <div className="mt-5 space-y-2">
                        <div className="w-[65%] h-1.5 rounded bg-muted" />
                        <div className="w-full h-1.5 rounded bg-muted" />
                        <div className="w-[88%] h-1.5 rounded bg-muted" />
                      </div>

                      {/* AI highlighted value */}
                      <div className="absolute left-4 top-[104px] w-[115px] h-5 rounded bg-primary/10 border border-primary/20 animate-pulse" />

                      <div className="absolute left-4 top-[107px] w-[92px] h-1.5 rounded bg-primary/30" />

                      {/* AI indicator */}
                      <div className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-background border border-border px-2 py-1 shadow-sm">
                        <Sparkles className="size-2.5 text-primary" />

                        <span className="text-[8px] font-medium">
                          AI analyzing
                        </span>

                        <span className="size-1 rounded-full bg-primary animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted values */}
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium">
                        Values identified in document
                      </p>

                      <p className="text-[10px] text-muted-foreground mt-1">
                        Extracted automatically by Clarus AI
                      </p>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                      <Sparkles className="size-3" />

                      <span className="text-[9px] font-medium">
                        98.7% confidence
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {EXTRACTED_VALUES.map(({ field, value }) => (
                      <div
                        key={field}
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-lg
                          border
                          border-border
                          bg-muted/20
                          px-3
                          py-2.5
                          transition-all
                          duration-300
                          hover:bg-muted/40
                        "
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-primary animate-pulse" />

                          <span className="text-xs text-muted-foreground">
                            {field}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Processing info */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock3 className="size-3" />
                      Processed in 2.4s
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-medium">
                      <CheckCircle2 className="size-3 text-green-500" />
                      Ready to use
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing activity */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="col-span-2 rounded-xl border border-border bg-card px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="size-3.5 text-muted-foreground" />

                      <span className="text-xs font-medium">
                        Processing activity
                      </span>
                    </div>

                    <span className="text-[10px] text-muted-foreground">
                      Last 7 days
                    </span>
                  </div>

                  <div className="flex items-end gap-1.5 h-12">
                    <div className="w-full rounded-sm bg-primary/15 h-[35%]" />
                    <div className="w-full rounded-sm bg-primary/20 h-[55%]" />
                    <div className="w-full rounded-sm bg-primary/25 h-[45%]" />
                    <div className="w-full rounded-sm bg-primary/30 h-[70%]" />
                    <div className="w-full rounded-sm bg-primary/40 h-[60%]" />
                    <div className="w-full rounded-sm bg-primary/50 h-[82%]" />
                    <div className="w-full rounded-sm bg-primary h-[100%]" />
                  </div>
                </div>

                {/* AI insight */}
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-3.5 text-primary" />

                    <span className="text-xs font-medium">
                      AI insight
                    </span>
                  </div>

                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    Contract values were extracted with high confidence.
                  </p>
                </div>
              </div>

              {/* Bottom status */}
              <div className="flex items-center justify-between mt-4 px-1">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="size-5 rounded-full bg-muted border-2 border-background" />
                    <div className="size-5 rounded-full bg-muted-foreground/30 border-2 border-background" />
                    <div className="size-5 rounded-full bg-primary/40 border-2 border-background" />
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    3 AI agents analyzed this document
                  </span>
                </div>

                <span className="text-[10px] text-muted-foreground font-mono">
                  CLARUS AI / v2.4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}