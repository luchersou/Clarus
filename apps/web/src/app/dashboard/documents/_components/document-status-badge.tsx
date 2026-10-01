import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DocumentStatus = "UPLOADED" | "PROCESSED" | "FAILED";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "destructive"; className?: string }
> = {
  UPLOADED: { label: "Processing", variant: "secondary" },
  PROCESSED: {
    label: "Ready",
    variant: "secondary",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  FAILED: { label: "Failed", variant: "destructive" },
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}