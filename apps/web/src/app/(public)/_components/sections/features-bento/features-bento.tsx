import type { ReactNode } from "react";
import { Reveal } from "../../reveal";
import { AccuracyPanel } from "./accuracy-panel";
import { ActionsPanel } from "./actions-panel";
import { FeatureCard } from "./feature-card";
import { FormatsPanel } from "./formats-panel";
import { PipelinePanel } from "./pipeline-panel";
import { SecurityPanel } from "./security-panel";

type Feature = {
  title: string;
  description: string;
  span: string;
  delay: number;
  panel: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Structured actions, or just ask",
    description:
      "Pick an action for a consistent result, or chat with your documents in plain language.",
    span: "lg:col-span-2",
    delay: 0,
    panel: <ActionsPanel />,
  },
  {
    title: "Any financial document",
    description: "Contracts, invoices, reports — Clarus reads them all.",
    span: "lg:col-span-1",
    delay: 0.12,
    panel: <FormatsPanel />,
  },
  {
    title: "Built for precision",
    description:
      "Financial data demands accuracy. Every extracted value is traceable back to the source.",
    span: "lg:col-span-1",
    delay: 0,
    panel: <AccuracyPanel />,
  },
  {
    title: "Event-driven pipeline",
    description:
      "Each document flows through an async, fault-tolerant processing chain.",
    span: "lg:col-span-2",
    delay: 0.12,
    panel: <PipelinePanel />,
  },
  {
    title: "Your documents stay yours",
    description:
      "Encrypted storage, isolated workspaces, no training on your data.",
    span: "lg:col-span-3",
    delay: 0,
    panel: <SecurityPanel />,
  },
];

export function FeaturesBento() {
  return (
    <section
      id="features"
      className="dark notched-card bg-background px-4 py-24 mx-2 text-foreground md:px-6 md:py-32"
    >
      {/* The dark theme has a neutral primary, so the brand green is set here */}
      <div className="mx-auto max-w-6xl [--primary-foreground:oklch(0.2_0.03_155)] [--primary:oklch(0.76_0.16_155)]">
        <Reveal>
          <h2 className="mb-16 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            Everything a financial document needs
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, span, delay, panel }) => (
            <Reveal key={title} delay={delay} className={span}>
              <FeatureCard title={title} description={description}>
                {panel}
              </FeatureCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
