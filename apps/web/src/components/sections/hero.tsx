import { Button } from "@/components/ui/button";
import { DashboardPreview } from "../dashboard-preview";

export function Hero() {
  return (
    <section className="px-4 py-8 md:px-6 md:py-12">
      <div className="relative">
        {/* border layer */}
        <div className="notched-card absolute inset-0 bg-border" />
        {/* translucent fill layer */}
        <div className="notched-card absolute inset-[1.5px] bg-primary/5" />

        <div className="relative flex flex-col items-center gap-8 px-8 py-20 text-center md:px-16 md:py-28">
          <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Ask your documents.
          </h1>

          <p className="max-w-md text-lg text-muted-foreground">
            Clarus reads your financial documents and answers with precision —
            no more digging through pages to find what matters.
          </p>

          <div className="flex gap-3">
            <Button size="lg">Get started for free</Button>
          </div>

					<DashboardPreview />
        </div>
      </div>
    </section>
  );
}