const LABELS = ["Summary", "Extract values", "Deadlines", "Compare"];

function SummaryResult() {
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full rounded-full bg-muted" />
      <div className="h-1.5 w-4/5 rounded-full bg-muted" />
      <div className="h-1.5 w-2/5 rounded-full bg-primary/60" />
    </div>
  );
}

function ExtractResult() {
  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono">$4,820.00</span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground">Tax</span>
        <span className="font-mono">$386.00</span>
      </div>
    </div>
  );
}

function DeadlinesResult() {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="size-1.5 rounded-full bg-primary" />
      <span className="text-muted-foreground">Due</span>
      <span className="font-mono">Oct 15</span>
    </div>
  );
}

function CompareResult() {
  return (
    <div className="flex items-end gap-1.5">
      <div className="h-6 w-2.5 rounded-sm bg-muted" />
      <div className="h-9 w-2.5 rounded-sm bg-primary/70" />
      <div className="h-4 w-2.5 rounded-sm bg-muted" />
    </div>
  );
}

function DocLines({ highlight }: { highlight: number }) {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={[
            "h-1.5 rounded-full transition-all duration-300",
            i === 4 ? "w-2/3" : "w-full",
            i === highlight
              ? "bg-primary/70 shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
              : "bg-muted",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

const RESULTS = [
  {
    highlight: 2,
    result: <SummaryResult />,
    source: "p.1 · 99%",
  },
  {
    highlight: 0,
    result: <ExtractResult />,
    source: "p.3 · 98%",
  },
  {
    highlight: 4,
    result: <DeadlinesResult />,
    source: "p.2 · 97%",
  },
  {
    highlight: 1,
    result: <CompareResult />,
    source: "p.4 · 96%",
  },
];

export function ActionsPanel() {
  return (
    <>
      <style>{`
        @keyframes action-selector {
          0%, 20% {
            transform: translateY(0);
          }

          25%, 45% {
            transform: translateY(40px);
          }

          50%, 70% {
            transform: translateY(80px);
          }

          75%, 95% {
            transform: translateY(120px);
          }

          100% {
            transform: translateY(0);
          }
        }

        @keyframes label-pulse {
          0%, 20% {
            opacity: 0.65;
            transform: translateX(0);
          }

          25%, 45% {
            opacity: 1;
            transform: translateX(3px);
          }

          50%, 100% {
            opacity: 0.65;
            transform: translateX(0);
          }
        }

        @keyframes document-result {
          0%, 15% {
            opacity: 0;
            transform: translateY(5px) scale(0.98);
          }

          20%, 42% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          48%, 100% {
            opacity: 0;
            transform: translateY(-3px) scale(0.98);
          }
        }

        @keyframes result-show {
          0%, 15% {
            opacity: 0;
            transform: translateY(6px);
          }

          20%, 42% {
            opacity: 1;
            transform: translateY(0);
          }

          48%, 100% {
            opacity: 0;
            transform: translateY(-4px);
          }
        }

        @keyframes document-scan {
          0% {
            transform: translateY(0);
          }

          100% {
            transform: translateY(100px);
          }
        }
      `}</style>
      <div className="flex w-full gap-3">
        {/* Actions */}
        <div className="relative min-w-0 flex-1 rounded-xl border border-border bg-background p-1.5">
          {/* Animated selection */}
          <div
            className="
              pointer-events-none
              absolute left-1.5 right-1.5 top-1.5
              h-9
              rounded-lg
              border border-primary/30
              bg-primary/10
              opacity-0
              group-hover:opacity-100
              group-hover:[animation:action-selector_6s_ease-in-out_infinite]
            "
          />

          <div className="relative flex flex-col gap-1">
            {LABELS.map((label, index) => (
              <div
                key={label}
                className={`
                  flex h-9 items-center
                  rounded-lg px-3
                  text-xs
                  transition-all duration-300
                  group-hover:[animation:label-pulse_6s_ease-in-out_infinite]
                  group-hover:[animation-delay:${index * 1.5}s]
                `}
              >
                <span className="text-muted-foreground transition-colors duration-300">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document */}
        <div className="relative hidden w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-card p-4 sm:block">
          {RESULTS.map((item, index) => (
            <div
              key={index}
              className="absolute inset-4 opacity-0 group-hover:[animation:document-result_6s_ease-in-out_infinite]"
              style={{
                animationDelay: `${index * 1.5}s`,
              }}
            >
              <DocLines highlight={item.highlight} />
            </div>
          ))}

          {/* Document scan line */}
          <div
            className="
              pointer-events-none
              absolute left-3 right-3 top-3
              h-px
              bg-primary/40
              opacity-0
              group-hover:opacity-100
              group-hover:[animation:document-scan_6s_ease-in-out_infinite]
            "
          />
        </div>

        {/* Result */}
        <div className="relative flex w-52 shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4">
          <div className="relative h-14">
            {RESULTS.map((item, index) => (
              <div
                key={index}
                className="
                  absolute inset-0
                  opacity-0
                  group-hover:[animation:result-show_6s_ease-in-out_infinite]
                "
                style={{
                  animationDelay: `${index * 1.5}s`,
                }}
              >
                {item.result}
              </div>
            ))}
          </div>

          <div className="relative h-5 border-t border-border pt-2">
            {RESULTS.map((item, index) => (
              <span
                key={index}
                className="
                  absolute inset-x-0
                  font-mono text-[10px]
                  text-muted-foreground
                  opacity-0
                  group-hover:[animation:result-show_6s_ease-in-out_infinite]
                "
                style={{
                  animationDelay: `${index * 1.5}s`,
                }}
              >
                {item.source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}