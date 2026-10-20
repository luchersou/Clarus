import { Lock } from "lucide-react";

export function SecurityPanel() {
  return (
    <>
      <style>{`
        /* =========================================
           TERMINAL
           ========================================= */

        @keyframes terminal-line-1 {
          0%, 8% {
            opacity: 0;
            transform: translateY(4px);
          }

          12%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminal-line-2 {
          0%, 22% {
            opacity: 0;
            transform: translateY(4px);
          }

          26%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminal-line-3 {
          0%, 36% {
            opacity: 0;
            transform: translateY(4px);
          }

          40%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminal-line-4 {
          0%, 50% {
            opacity: 0;
            transform: translateY(4px);
          }

          54%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminal-line-5 {
          0%, 64% {
            opacity: 0;
            transform: translateY(4px);
          }

          68%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes terminal-cursor {
          0%, 45% {
            opacity: 1;
          }

          50%, 95% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        /* =========================================
           SECURITY CARD
           ========================================= */

        @keyframes security-card {
          0%, 62% {
            left: 105%;
            opacity: 0;
          }

          70% {
            left: 25%;
            opacity: 1;
          }

          82%, 100% {
            left: 25%;
            opacity: 1;
          }
        }

        /* =========================================
           SECURITY CONTENT
           Only appears after card stops.
           ========================================= */

        @keyframes security-content {
          0%, 78% {
            opacity: 0;
            transform: translateY(5px) scale(0.95);
          }

          84% {
            opacity: 1;
            transform: translateY(0) scale(1.03);
          }

          90%, 100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes security-icon {
          0%, 78% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }

          84% {
            opacity: 1;
            transform: scale(1.15) rotate(0deg);
          }

          90%, 100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes security-pulse {
          0%, 82% {
            opacity: 0;
            transform: scale(0.8);
          }

          88% {
            opacity: 0.5;
            transform: scale(1.15);
          }

          94%, 100% {
            opacity: 0;
            transform: scale(1.35);
          }
        }
      `}</style>

      <div className="group relative h-40 w-full overflow-hidden">
        {/* =========================================
            TERMINAL
            ========================================= */}

        <div
          className="
            absolute left-0 top-1/2
            h-[118px] w-[58%] max-w-[360px] min-w-[220px]
            -translate-y-1/2
            overflow-hidden
            rounded-lg
            border border-border
            bg-zinc-950
            shadow-sm
          "
        >
          {/* Terminal header */}

          <div className="flex h-6 items-center justify-between border-b border-white/10 px-2.5">
            <div className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-red-500" />
              <span className="size-1.5 rounded-full bg-yellow-500" />
              <span className="size-1.5 rounded-full bg-green-500" />
            </div>

            <span className="font-mono text-[5px] text-white/30">
              CLARUS / AUDIT
            </span>
          </div>

          {/* Terminal body */}

          <div className="p-1.5 font-mono text-[6px] leading-relaxed">
            <div className="mb-2 flex items-center gap-1 text-white/40">
              <span>root@clarus</span>
              <span>:</span>
              <span className="text-white/60">~</span>
              <span>$</span>

              <span className="text-white/70">
                secure invoice.pdf
              </span>
            </div>

            <div className="space-y-1">
              {/* LINE 1 */}

              <div
                className="
                  flex gap-1.5 text-white/60 opacity-0
                  group-hover:[animation:terminal-line-1_6s_ease-out_infinite]
                "
              >
                <span className="text-white/25">01</span>
                <span className="text-white/35">›</span>
                <span>Encrypting payload...</span>
              </div>

              {/* LINE 2 */}

              <div
                className="
                  flex gap-1.5 text-white/60 opacity-0
                  group-hover:[animation:terminal-line-2_6s_ease-out_infinite]
                "
              >
                <span className="text-white/25">02</span>
                <span className="text-white/35">›</span>
                <span>Generating SHA-256...</span>
              </div>

              {/* LINE 3 */}

              <div
                className="
                  flex gap-1.5 text-white/60 opacity-0
                  group-hover:[animation:terminal-line-3_6s_ease-out_infinite]
                "
              >
                <span className="text-white/25">03</span>
                <span className="text-white/35">›</span>
                <span>Creating isolated workspace...</span>
              </div>

              {/* LINE 4 */}

              <div
                className="
                  flex gap-1.5 text-white/60 opacity-0
                  group-hover:[animation:terminal-line-4_6s_ease-out_infinite]
                "
              >
                <span className="text-white/25">04</span>
                <span className="text-white/35">›</span>
                <span>Storage policy applied...</span>
              </div>

              {/* LINE 5 */}

              <div
                className="
                  flex gap-1.5 text-white/70 opacity-0
                  group-hover:[animation:terminal-line-5_6s_ease-out_infinite]
                "
              >
                <span className="text-white/25">05</span>
                <span className="text-white/35">›</span>

                <span className="text-white/80">
                  Document secured.
                </span>
              </div>
            </div>

            {/* Cursor */}

            <div className="mt-1 flex items-center gap-1 text-white/40">
              <span>›</span>

              <span
                className="
                  inline-block h-2 w-[3px] bg-white/60
                  group-hover:[animation:terminal-cursor_0.8s_step-end_infinite]
                "
              />
            </div>
          </div>
        </div>

        {/* =========================================
            SECURITY RESULT CARD
            ========================================= */}

        <div
          className="
            absolute top-1/2
            z-20
            h-[106px] w-[43%] md:w-[180px]
            -translate-y-1/2
            overflow-hidden
            rounded-lg
            border border-primary/30
            bg-card
            shadow-lg
            opacity-0

            group-hover:[animation:security-card_6s_ease-in-out_infinite]
          "
        >
          {/* Subtle glow */}

          <div
            className="
              pointer-events-none
              absolute left-1/2 top-1/2
              size-20
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              bg-primary/10
              blur-xl
              opacity-0

              group-hover:[animation:security-pulse_6s_ease-out_infinite]
            "
          />

          {/* Content */}

          <div
            className="
              relative flex h-full
              flex-col items-center justify-center
              opacity-0

              group-hover:[animation:security-content_6s_ease-out_infinite]
            "
          >
            {/* Icon */}

            <div
              className="
                mb-2 flex size-8
                items-center justify-center
                rounded-full
                border border-primary/30
                bg-primary/10
                text-primary
                opacity-0

                group-hover:[animation:security-icon_6s_ease-out_infinite]
              "
            >
              <span className="text-sm">✓</span>
            </div>

            {/* Main message */}

            <span className="font-mono text-[8px] font-semibold tracking-wide">
              DOCUMENT SECURE
            </span>

            {/* Details */}

            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[5px] text-muted-foreground">
                AES-256
              </span>

              <span className="h-2 w-px bg-border" />

              <span className="font-mono text-[5px] text-muted-foreground">
                SHA-256
              </span>

              <span className="h-2 w-px bg-border" />

              <span className="font-mono text-[5px] text-muted-foreground">
                PRIVATE
              </span>
            </div>
          </div>
        </div>

				<div className="absolute right-2 z-30 hidden h-[220px] w-[360px] flex-col justify-between rounded-lg border border-border bg-card p-4 shadow-sm md:flex">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="flex size-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
								<Lock className="size-3" />
							</div>
							<span className="font-mono text-[7px] font-medium tracking-wide">
								SECURITY PROFILE
							</span>
						</div>

						<div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5">
							<span className="relative flex size-1.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
								<span className="relative inline-flex size-1.5 rounded-full bg-green-500" />
							</span>
							<span className="font-mono text-[5px] font-medium text-primary">ACTIVE</span>
						</div>
					</div>

					{/* Technical Details */}
					<div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">ENCRYPTION</span>
							<span className="font-mono text-[5px] text-foreground">AES-256</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">HASHING</span>
							<span className="font-mono text-[5px] text-foreground">SHA-256</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">STORAGE</span>
							<span className="font-mono text-[5px] text-foreground">ISOLATED</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">REGION</span>
							<span className="font-mono text-[5px] text-foreground">SA-EAST-1</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">RETENTION</span>
							<span className="font-mono text-[5px] text-foreground">USER-DEFINED</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-mono text-[5px] text-muted-foreground">LAST AUDIT</span>
							<span className="font-mono text-[5px] text-foreground">2H AGO</span>
						</div>
					</div>

					{/* Compliance Badges */}
					<div className="flex items-center gap-1.5">
						{["SOC 2", "GDPR", "ISO 27001"].map((label) => (
							<span
								key={label}
								className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[5px] text-muted-foreground"
							>
								{label}
							</span>
						))}
					</div>

					{/* Footer */}
					<div className="flex items-center gap-1.5 border-t border-border pt-1.5">
						<span className="size-1 rounded-full bg-primary" />
						<span className="font-mono text-[5px] text-muted-foreground">
							No training on your data
						</span>
					</div>
				</div>

        {/* =========================================
            SMALL LABEL
            ========================================= */}

        <div
          className="
            absolute bottom-0 left-0
            font-mono text-[6px]
            tracking-wide
            text-muted-foreground
          "
        >
          REAL-TIME SECURITY AUDIT
        </div>
      </div>
    </>
  );
}