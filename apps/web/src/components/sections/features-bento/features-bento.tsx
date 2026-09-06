import type { ReactNode } from "react";
import { ActionsPanel } from "./actions-panel";
import { FormatsPanel } from "./formats-panel";
import { AccuracyPanel } from "./accuracy-panel";
import { PipelinePanel } from "./pipeline-panel";
import { SecurityPanel } from "./security-panel";

type Feature = {
  title: string;
  description: string;
  span: string;
  panel: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Structured, not conversational",
    description:
      "No prompt writing. Pick an action and get a consistent, predictable result every time.",
    span: "md:col-span-2",
    panel: <ActionsPanel />,
  },
  {
    title: "Any financial document",
    description: "Contracts, invoices, reports — Clarus reads them all.",
    span: "md:col-span-1",
    panel: <FormatsPanel />,
  },
  {
    title: "Built for precision",
    description:
      "Financial data demands accuracy. Every extracted value is traceable back to the source.",
    span: "md:col-span-1",
    panel: <AccuracyPanel />,
  },
  {
    title: "Event-driven pipeline",
    description:
      "Each document flows through an async, fault-tolerant processing chain.",
    span: "md:col-span-2",
    panel: <PipelinePanel />,
  },
  {
    title: "Your documents stay yours",
    description:
      "Encrypted storage, isolated workspaces, no training on your data.",
    span: "md:col-span-3",
    panel: <SecurityPanel />,
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="dark notched-card bg-background px-4 py-24 mx-2 text-foreground md:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          Everything a financial document needs
        </h2>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`group notched-card relative overflow-hidden rounded-2xl border border-border bg-card p-8 ${feature.span}`}
            >
              <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
                  {feature.panel}
                </div>
              </div>

              {/* esfumado */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}