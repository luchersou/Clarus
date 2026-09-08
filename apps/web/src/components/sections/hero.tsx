import { Button } from "@/components/ui/button";
import { DashboardPreview } from "../dashboard-preview";

export function Hero() {
  return (
    <section className="px-2 pb-2 md:px-6 bg-gray-100">

      {/* Background grid */}
      <div
        className="
          pointer-events-none
          absolute
          -right-0
          -top-0
          h-80 md:h-124
          w-80 md:w-140
          opacity-[0.12]
          [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
          [background-size:52px_52px]
          text-foreground
          [mask-image:linear-gradient(to_bottom_left,black,transparent_75%)]
        "
      />
      <div
        className="
          pointer-events-none
          absolute
          bottom-22 md:-bottom-0
          -left-0
          h-80 md:h-124
          w-80 md:w-140
          opacity-[0.12]
          [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
          [background-size:52px_52px]
          text-foreground
          [mask-image:linear-gradient(to_top_right,black,transparent_75%)]
        "
      />
      
      <div className="relative overflow-hidden pb-15">

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