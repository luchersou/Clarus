const DOCUMENTS = [
  { label: "CONTRACT", type: "DOC", tx: "-56px", ty: "-20px", rot: "-6deg", color: "#2563eb" },
  { label: "INVOICE", type: "INV", tx: "0px", ty: "32px", rot: "0deg", color: "#d97706" },
  { label: "REPORT", type: "PDF", tx: "56px", ty: "-20px", rot: "6deg", color: "#dc2626" },
];

export function FormatsPanel() {
  return (
    <>
      <style>{`
        @keyframes formats-doc {
          0%, 100% {
            transform: translate(var(--doc-tx), var(--doc-ty)) rotate(var(--doc-rot)) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(0, 0) rotate(0deg) scale(0.9);
            opacity: 0.4;
          }
        }
        @keyframes formats-core {
          0%, 35% { opacity: 0; transform: scale(0.75); }
          50%, 85% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.75); }
        }
        @keyframes formats-core-dot {
          0%, 35% { transform: scale(1); }
          50% { transform: scale(1.25); }
          85%, 100% { transform: scale(1); }
        }
        @keyframes formats-ring {
          0%, 40% { opacity: 0; transform: scale(0.75); }
          55%, 80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.75); }
        }
      `}</style>

      <div className="relative h-36 w-full">
        {DOCUMENTS.map((document) => (
          <div key={document.label} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              style={{
                ["--doc-tx" as string]: document.tx,
                ["--doc-ty" as string]: document.ty,
                ["--doc-rot" as string]: document.rot,
                transform: `translate(${document.tx}, ${document.ty}) rotate(${document.rot})`,
              }}
              className="flex h-20 w-16 flex-col justify-between rounded-lg border border-border bg-background p-2.5 shadow-sm group-hover:[animation:formats-doc_3s_ease-in-out_infinite]"
            >
              <div className="space-y-1.5">
                <div className="h-1 w-7 rounded-full bg-muted" />
                <div className="h-1 w-10 rounded-full bg-muted" />
                <div className="h-1 w-8 rounded-full bg-muted" />
                <div className="h-1 w-6 rounded-full bg-muted" />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[7px] font-medium"
                  style={{ color: document.color }}
                >
                  {document.type}
                </span>
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: document.color }}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Clarus core */}
        <div className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 opacity-0 scale-75 group-hover:[animation:formats-core_3s_ease-in-out_infinite]">
          <div className="size-2.5 rounded-full bg-primary group-hover:[animation:formats-core-dot_3s_ease-in-out_infinite]" />
        </div>

        {/* Processing ring */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 opacity-0 scale-75 group-hover:[animation:formats-ring_3s_ease-in-out_infinite]" />
      </div>
    </>
  );
}