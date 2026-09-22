import { Badge } from "@/components/ui/badge";

type DocumentStatus = "UPLOADED" | "PROCESSED" | "FAILED";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  UPLOADED: { label: "Processing", variant: "secondary" },
  PROCESSED: { label: "Ready", variant: "outline" },
  FAILED: { label: "Failed", variant: "destructive" },
};

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}