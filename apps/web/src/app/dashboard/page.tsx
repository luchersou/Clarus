import { Suspense } from "react";
import { DashboardWelcome } from "./_components/home/dashboard-welcome";
import { DashboardMetrics } from "./_components/home/dashboard-metrics";
import { RecentAnalysesCard } from "./_components/home/recent-analyses-card";
import { RecentDocumentsCard } from "./_components/home/recent-documents-card";
import { DashboardGettingStarted } from "./_components/home/dashboard-getting-started";
import { DashboardMetricsSkeleton } from "./_components/home/dashboard-metrics-skeleton";
import { RecentAnalysesCardSkeleton } from "./_components/home/recent-analyses-card-skeleton";
import { RecentDocumentsCardSkeleton } from "./_components/home/recent-documents-card-skeleton";
import { DashboardWelcomeSkeleton } from "./_components/home/dashboard-welcome-skeleton";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <Suspense fallback={<DashboardWelcomeSkeleton />}>
        <DashboardWelcome />
      </Suspense>

      <Suspense fallback={<DashboardMetricsSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Suspense fallback={<RecentAnalysesCardSkeleton />}>
          <RecentAnalysesCard />
        </Suspense>

        <aside aria-label="Documents and next steps" className="flex flex-col gap-4">
          <Suspense fallback={<RecentDocumentsCardSkeleton />}>
            <RecentDocumentsCard />
          </Suspense>
          <DashboardGettingStarted />
        </aside>
      </div>
    </div>
  );
}
