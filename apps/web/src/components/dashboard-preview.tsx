import { Home, FileText, BarChart3, GitCompare, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home },
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

export function DashboardPreview() {
  return (
    <section className="hidden sm:block relative w-full max-w-6xl mx-auto px-4 py-20">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
        {/* Top bar */}
        <div className="flex items-center px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-auto px-4 py-1 rounded-md bg-background border border-border text-[10px] text-muted-foreground tracking-widest font-mono">
            app.clarus.com/dashboard
          </div>
        </div>

        {/* Dashboard layout */}
        <div className="flex h-[500px] bg-background">
          {/* Sidebar */}
          <div className="hidden md:flex w-56 border-r border-border flex-col py-6 px-3 bg-muted/20">
            <div className="px-3 mb-8">
              <span className="text-lg font-semibold tracking-tight">Clarus</span>
            </div>

            <div className="space-y-1 flex-1">
              {NAV_ITEMS.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                >
                  <Icon className="size-4 mr-3" />
                  {label}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 px-3">
              <div className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Settings className="size-4 mr-3" />
                Settings
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium">Supplier_Contract_2026.pdf</p>
                <p className="text-xs text-muted-foreground">Processed 2 minutes ago</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {ACTIONS.map(({ label, active }) => (
                <div
                  key={label}
                  className={
                    active
                      ? "px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                      : "px-4 py-2 rounded-full text-sm text-muted-foreground border border-border"
                  }
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Result card */}
            <div className="rounded-xl border border-border bg-card p-5 max-w-md">
              <p className="text-xs text-muted-foreground mb-4">
                Values identified in document
              </p>
              <div className="space-y-3">
                {EXTRACTED_VALUES.map(({ field, value }) => (
                  <div key={field} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{field}</span>
                    <span className="text-sm font-mono font-medium">{value}</span>
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