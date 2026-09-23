import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface JourneyStep {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}

const STEPS: JourneyStep[] = [
  {
    title: "Upload a document",
    description:
      "Add a PDF, Word, or Excel file. Once processed, it's ready for analysis and chat.",
    href: "/dashboard/documents",
    actionLabel: "Upload document",
  },
  {
    title: "Run an analysis",
    description:
      "Pick a document and extract a summary, key values, deadlines, or a comparison.",
    href: "/dashboard/analyses",
    actionLabel: "Run analysis",
  },
  {
    title: "Ask the chatbot",
    description:
      "Start a conversation about a document, or across all of them, in plain language.",
    href: "/dashboard/chat",
    actionLabel: "Start chatting",
  },
];

export function DashboardGettingStarted() {
  return (
    <Card>
      <CardHeader className="space-y-2 border-b px-5 py-4">
        <CardTitle className="text-base">Getting started</CardTitle>
        <CardDescription className="text-xs leading-5">
          A simple path from document to answers.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 py-5">
        <ol>
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
            >
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-4 top-8 w-px bg-border"
                />
              ) : null}

              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-sm border bg-card text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>

              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {step.description}
                </p>
                <Link
                  href={step.href}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {step.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}