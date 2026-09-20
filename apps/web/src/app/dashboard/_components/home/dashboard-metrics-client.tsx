import Link from "next/link";
import { FileText, Clock, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardMetricsClientProps {
  documentsCount: number;
  documentsReadyCount: number;
  analysesPendingCount: number;
}

export function DashboardMetricsClient({
  documentsCount,
  documentsReadyCount,
  analysesPendingCount,
}: DashboardMetricsClientProps) {
  const metrics = [
    {
      label: "Documents",
      value: documentsCount,
      icon: FileText,
      href: "/dashboard/documents",
    },
    {
      label: "Ready for analysis",
      value: documentsReadyCount,
      icon: FileCheck,
      href: "/dashboard/documents",
    },
    {
      label: "Analyses pending",
      value: analysesPendingCount,
      icon: Clock,
      href: "/dashboard/analyses",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3" aria-label="Workspace totals">
      {metrics.map((metric) => (
        <Link href={metric.href} key={metric.label}>
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </CardTitle>
              <metric.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}