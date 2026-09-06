const STEPS = [
  {
    number: "01",
    label: "INGEST",
    description: "Received",
  },
  {
    number: "02",
    label: "ANALYZE",
    description: "Processing",
  },
  {
    number: "03",
    label: "VERIFY",
    description: "Checking",
  },
  {
    number: "04",
    label: "DONE",
    description: "Complete",
  },
];

export function PipelinePanel() {
  return (
    <>
      <style>{`
        @keyframes pipeline-document {
          0% {
            left: 4%;
            opacity: 0;
          }

          6% {
            opacity: 1;
          }

          18% {
            left: 4%;
          }

          35% {
            left: 36%;
          }

          52% {
            left: 64%;
          }

          69% {
            left: 96%;
          }

          78% {
            left: 96%;
            opacity: 1;
          }

          86% {
            left: 96%;
            opacity: 0;
          }

          100% {
            left: 4%;
            opacity: 0;
          }
        }

        @keyframes pipeline-node-1 {
          0%, 28% {
            transform: scale(1);
            border-color: hsl(var(--border));
            box-shadow: none;
          }

          30%, 40% {
            transform: scale(1.25);
            border-color: hsl(var(--primary) / 0.5);
            box-shadow: 0 0 18px hsl(var(--primary) / 0.15);
          }

          42%, 100% {
            transform: scale(1);
          }
        }

        @keyframes pipeline-node-2 {
          0%, 45% {
            transform: scale(1);
            border-color: hsl(var(--border));
            box-shadow: none;
          }

          47%, 57% {
            transform: scale(1.25);
            border-color: hsl(var(--primary) / 0.5);
            box-shadow: 0 0 18px hsl(var(--primary) / 0.15);
          }

          59%, 100% {
            transform: scale(1);
          }
        }

        @keyframes pipeline-node-3 {
          0%, 62% {
            transform: scale(1);
            border-color: hsl(var(--border));
            box-shadow: none;
          }

          64%, 74% {
            transform: scale(1.25);
            border-color: hsl(var(--primary) / 0.5);
            box-shadow: 0 0 18px hsl(var(--primary) / 0.15);
          }

          76%, 100% {
            transform: scale(1);
          }
        }

        @keyframes pipeline-success {
          0%, 74% {
            transform: scale(1);
            border-color: hsl(var(--border));
            background: hsl(var(--card));
            box-shadow: none;
          }

          78% {
            transform: scale(1.3);
            border-color: hsl(var(--primary) / 0.6);
            background: hsl(var(--primary) / 0.1);
            box-shadow: 0 0 24px hsl(var(--primary) / 0.2);
          }

          86%, 100% {
            transform: scale(1.12);
            border-color: hsl(var(--primary) / 0.5);
            background: hsl(var(--primary) / 0.08);
            box-shadow: 0 0 18px hsl(var(--primary) / 0.15);
          }
        }

        @keyframes pipeline-check {
          0%, 77% {
            opacity: 0;
            transform: scale(0.5);
          }

          80% {
            opacity: 1;
            transform: scale(1.2);
          }

          84%, 100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pipeline-line {
          0% {
            width: 0%;
          }

          18% {
            width: 0%;
          }

          35% {
            width: 32%;
          }

          52% {
            width: 64%;
          }

          69% {
            width: 96%;
          }

          78%, 100% {
            width: 96%;
          }
        }
      `}</style>

      <div className="group relative h-36 w-full overflow-hidden">
        {/* Base line */}
        <div
          className="
            absolute
            left-[4%]
            right-[4%]
            top-1/2
            h-px
            -translate-y-1/2
            bg-border
          "
        />

        {/* Animated progress line */}
        <div
          className="
            absolute
            left-[4%]
            top-1/2
            h-px
            -translate-y-1/2
            bg-primary/50
            opacity-0
            group-hover:opacity-100
            group-hover:[animation:pipeline-line_4.5s_ease-in-out_forwards]
          "
        />

        {/* Steps */}
        <div
          className="
            absolute
            inset-x-[2%]
            top-1/2
            flex
            -translate-y-1/2
            justify-between
          "
        >
          {STEPS.map((step, index) => {
            const animation =
              index === 0
                ? "pipeline-node-1"
                : index === 1
                  ? "pipeline-node-2"
                  : index === 2
                    ? "pipeline-node-3"
                    : "pipeline-success";

            return (
              <div
                key={step.label}
                className="relative flex w-16 flex-col items-center"
              >
                {/* Node */}
								<div
									className={`
										relative
										z-10
										flex
										size-8
										items-center
										justify-center
										rounded-full
										border
										bg-card
										opacity-90
										transition-all
										duration-300
										group-hover:opacity-100
										group-hover:[animation:${animation}_4.5s_ease-in-out_forwards]
									`}
								>
									<span className="font-mono text-[7px] text-muted-foreground">
										{step.number}
									</span>

									{index === 3 && (
										<span
											className="
												absolute
												-right-2
												-top-2
												flex
												size-3.5
												items-center
												justify-center
												rounded-full
												border
												border-primary/40
												bg-card
												text-[8px]
												text-primary
												opacity-0
												scale-50
												group-hover:[animation:pipeline-check_4.5s_ease-in-out_forwards]
											"
										>
											✓
										</span>
									)}
								</div>

                {/* Label */}
                <div className="absolute top-11 flex flex-col items-center">
                  <span className="font-mono text-[7px] font-medium tracking-wide">
                    {step.label}
                  </span>

                  <span className="mt-0.5 whitespace-nowrap text-[6px] text-muted-foreground">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Moving document */}
        <div
          className="
            pointer-events-none
            absolute
            left-[4%]
            top-1/2
            z-20
            flex
            h-7
            w-16
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            gap-1.5
            rounded-md
            border
            border-primary/30
            bg-card
            px-2
            shadow-sm
            opacity-0
            group-hover:[animation:pipeline-document_4.5s_ease-in-out_forwards]
          "
        >
          <div className="flex size-3.5 items-center justify-center rounded-sm bg-primary/10">
            <span className="font-mono text-[6px] font-medium text-primary">
              PDF
            </span>
          </div>

          <span className="font-mono text-[6px] text-muted-foreground">
            invoice.pdf
          </span>
        </div>

        {/* Status */}
        <div
          className="
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-full
            border
            border-border
            bg-card
            px-2.5
            py-1
            font-mono
            text-[6px]
            text-muted-foreground
            transition-all
            duration-300
            group-hover:border-primary/30
          "
        >
          ASYNC · FAULT TOLERANT
        </div>
      </div>
    </>
  );
}
