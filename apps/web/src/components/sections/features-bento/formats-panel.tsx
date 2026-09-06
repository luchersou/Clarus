const DOCUMENTS = [
  {
    label: "CONTRACT",
    type: "DOC",
    position: "left",
  },
  {
    label: "INVOICE",
    type: "INV",
    position: "center",
  },
  {
    label: "REPORT",
    type: "PDF",
    position: "right",
  },
];

export function FormatsPanel() {
  return (
    <div className="relative h-36 w-full">
      {/* Documents */}
      {DOCUMENTS.map((document, index) => (
        <div
          key={document.label}
          className={`
            absolute left-1/2 top-1/2
            flex h-20 w-16
            -translate-x-1/2 -translate-y-1/2
            flex-col justify-between
            rounded-lg
            border border-border
            bg-background
            p-2.5
            shadow-sm
            transition-all
            duration-700
            ease-out

            ${
              document.position === "left"
                ? "-ml-14 -mt-5 -rotate-6"
                : document.position === "right"
                  ? "ml-14 -mt-5 rotate-6"
                  : "mt-8 rotate-0"
            }

            group-hover:ml-0
            group-hover:mt-0
            group-hover:rotate-0
            group-hover:scale-90
            group-hover:opacity-40
          `}
        >
          <div className="space-y-1.5">
            <div className="h-1 w-7 rounded-full bg-muted" />
            <div className="h-1 w-10 rounded-full bg-muted" />
            <div className="h-1 w-8 rounded-full bg-muted" />
            <div className="h-1 w-6 rounded-full bg-muted" />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[7px] text-muted-foreground">
              {document.type}
            </span>

            <span className="size-1.5 rounded-full bg-muted" />
          </div>
        </div>
      ))}

      {/* Clarus core */}
      <div
        className="
          absolute left-1/2 top-1/2
          flex size-12
          -translate-x-1/2 -translate-y-1/2
          items-center justify-center
          rounded-xl
          border border-primary/30
          bg-primary/10
          opacity-0
          scale-75
          transition-all
          duration-500
          ease-out
          group-hover:scale-100
          group-hover:opacity-100
        "
      >
        <div
          className="
            size-2.5
            rounded-full
            bg-primary
            shadow-[0_0_14px_hsl(var(--primary)/0.5)]
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />
      </div>

      {/* Processing ring */}
      <div
        className="
          pointer-events-none
          absolute left-1/2 top-1/2
          size-16
          -translate-x-1/2 -translate-y-1/2
          rounded-full
          border border-primary/20
          opacity-0
          scale-75
          transition-all
          duration-700
          group-hover:scale-100
          group-hover:opacity-100
        "
      />
    </div>
  );
}