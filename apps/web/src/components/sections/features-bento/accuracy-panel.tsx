export function AccuracyPanel() {
  return (
    <div className="relative h-36 w-full">
      {/* Document */}
      <div
        className="
          absolute left-1/2 top-1/2
          w-[min(100%,220px)]
          -translate-x-1/2 -translate-y-1/2
          rounded-lg
          border border-border
          bg-background
          p-3
          shadow-sm
          transition-transform
          duration-500
          ease-out
          group-hover:-translate-y-[58%]
        "
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[7px] font-medium text-muted-foreground">
            INVOICE #2048
          </span>

          <span className="font-mono text-[7px] text-muted-foreground">
            SEP 2026
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[7px] text-muted-foreground">
              Subtotal
            </span>

            <span className="font-mono text-[7px] text-muted-foreground">
              $11,200.00
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[7px] text-muted-foreground">
              Tax
            </span>

            <span className="font-mono text-[7px] text-muted-foreground">
              $1,280.00
            </span>
          </div>

          {/* Highlighted source */}
          <div
            className="
              mt-2
              flex items-center justify-between
              rounded-md
              border border-primary/30
              bg-primary/5
              px-2 py-1.5
              transition-all
              duration-500
              ease-out
              group-hover:border-primary/50
              group-hover:bg-primary/10
            "
          >
            <span className="text-[7px] font-medium">
              Total Due
            </span>

            <span className="font-mono text-[7px] font-semibold">
              $12,480.00
            </span>
          </div>
        </div>

        {/* Source marker */}
        <div
          className="
            absolute bottom-2 -right-1
            size-2
            rounded-full
            border border-primary/40
            bg-background
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />
      </div>

      {/* Verification */}
      <div
        className="
          absolute bottom-0 left-1/2
          flex
          -translate-x-1/2
          items-center gap-1.5
          rounded-full
          border border-border
          bg-card
          px-2.5 py-1
          opacity-70
          scale-95
          transition-all
          duration-500
          ease-out
          group-hover:scale-100
          group-hover:border-primary/30
          group-hover:opacity-100
        "
      >
        <span
          className="
            flex size-3.5
            items-center justify-center
            rounded-full
            bg-primary/10
            text-[7px]
            text-primary
          "
        >
          ✓
        </span>

        <span className="text-[7px] text-muted-foreground">
          Source verified
        </span>
      </div>

      {/* Connection */}
      <div
        className="
          absolute bottom-6 left-1/2
          h-5 w-px
          -translate-x-1/2
          origin-top
          bg-primary/30
          scale-y-50
          opacity-40
          transition-all
          duration-500
          group-hover:scale-y-100
          group-hover:opacity-100
        "
      />
    </div>
  );
}
