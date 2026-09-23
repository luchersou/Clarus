import { Badge } from "@/components/ui/badge";

type AnalysisStatus = "PENDING" | "COMPLETED" | "FAILED";

const STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Processing", variant: "secondary" as const },
  COMPLETED: { label: "Completed", variant: "outline" as const },
  FAILED: { label: "Failed", variant: "destructive" as const },
};

interface AnalysisStatusBadgeProps {
  status: AnalysisStatus;
}

export function AnalysisStatusBadge({ status }: AnalysisStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}