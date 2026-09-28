import { Suspense } from "react";
import { DashboardWelcome } from "./_components/home/dashboard-welcome";
import { DashboardMetrics } from "./_components/home/dashboard-metrics";
import { RecentAnalysesCard } from "./_components/home/recent-analyses-card";
import { DashboardGettingStarted } from "./_components/home/dashboard-getting-started";
import { DashboardMetricsSkeleton } from "./_components/home/dashboard-metrics-skeleton";
import { RecentAnalysesCardSkeleton } from "./_components/home/recent-analyses-card-skeleton";
import { DashboardWelcomeSkeleton } from "./_components/home/dashboard-welcome-skeleton";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Suspense fallback={<DashboardWelcomeSkeleton />}>
          <DashboardWelcome />
        </Suspense>

        <aside aria-label="Getting started" className="lg:row-span-2">
          <DashboardGettingStarted />
        </aside>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<DashboardMetricsSkeleton />}>
            <DashboardMetrics />
          </Suspense>

          <Suspense fallback={<RecentAnalysesCardSkeleton />}>
            <RecentAnalysesCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}