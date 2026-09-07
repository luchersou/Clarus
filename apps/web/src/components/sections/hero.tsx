import { Button } from "@/components/ui/button";
import { DashboardPreview } from "../dashboard-preview";

export function Hero() {
  return (
    <section className="px-2 py-15 md:px-6 bg-gray-100">
      <div className="relative overflow-hidden">

        <div className="relative flex flex-col items-center gap-8 px-8 pt-20 md:pt-30 text-center md:px-16 ">
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
        </div>

      </div>

      <DashboardPreview />      
    </section>
  );
}