import { Suspense } from "react";
import { DashboardWelcome } from "./_components/home/dashboard-welcome";
import { DashboardMetrics } from "./_components/home/dashboard-metrics";
import { RecentAnalysesCard } from "./_components/home/recent-analyses-card";
import { DashboardGettingStarted } from "./_components/home/dashboard-getting-started";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardWelcome />
        </Suspense>

        <aside aria-label="Getting started" className="lg:row-span-2">
          <DashboardGettingStarted />
        </aside>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardMetrics />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <RecentAnalysesCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}