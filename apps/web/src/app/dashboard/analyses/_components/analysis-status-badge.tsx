import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AnalysisStatus = "PENDING" | "COMPLETED" | "FAILED";

const STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; variant: "secondary" | "destructive"; className?: string }
> = {
  PENDING: { label: "Processing", variant: "secondary" },
  COMPLETED: {
    label: "Completed",
    variant: "secondary",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  FAILED: { label: "Failed", variant: "destructive" },
};

interface AnalysisStatusBadgeProps {
  status: AnalysisStatus;
}

export function AnalysisStatusBadge({ status }: AnalysisStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}