import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

interface JourneyStep {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  done: boolean;
}

export async function DashboardGettingStarted() {
  const summary = await getDashboardSummary();
  const hasDocuments = summary.documentsCount > 0;
  const hasAnalyses = summary.recentAnalyses.length > 0;

  // The checklist has done its job once the user has uploaded and analyzed something.
  if (hasDocuments && hasAnalyses) return null;

  const steps: JourneyStep[] = [
    {
      title: "Upload a document",
      description:
        "Add a PDF, Word, or Excel file. Once processed, it's ready for analysis and chat.",
      href: "/dashboard/documents",
      actionLabel: "Upload document",
      done: hasDocuments,
    },
    {
      title: "Run an analysis",
      description:
        "Pick a document and extract a summary, key values, deadlines, or a comparison.",
      href: "/dashboard/analyses",
      actionLabel: "Run analysis",
      done: hasAnalyses,
    },
    {
      title: "Ask the chatbot",
      description:
        "Start a conversation about a document, or across all of them, in plain language.",
      href: "/dashboard/chat",
      actionLabel: "Start chatting",
      done: false,
    },
  ];

  const nextStepIndex = steps.findIndex((step) => !step.done);
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Getting started</CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground">
            {doneCount} of {steps.length}
          </span>
        </div>
        <CardDescription className="text-xs leading-5">
          A simple path from document to answers.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ol>
          {steps.map((step, index) => {
            const isNext = index === nextStepIndex;

            return (
              <li
                key={step.title}
                className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0"
              >
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-8 bottom-1 left-4 w-px",
                      step.done ? "bg-primary/40" : "bg-border",
                    )}
                  />
                ) : null}

                <span
                  className={cn(
                    "relative z-10 flex size-8 items-center justify-center rounded-lg border text-xs font-semibold",
                    step.done && "border-primary bg-primary text-primary-foreground",
                    isNext && "border-primary text-primary bg-card",
                    !step.done && !isNext && "bg-card text-muted-foreground",
                  )}
                >
                  {step.done ? <Check className="size-4" aria-label="Done" /> : index + 1}
                </span>

                <div className="min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.done ? "text-muted-foreground line-through" : "text-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  {!step.done ? (
                    <>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {step.description}
                      </p>
                      <Link
                        href={step.href}
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline",
                          isNext ? "text-primary" : "text-foreground",
                        )}
                      >
                        {step.actionLabel}
                        <ArrowRight className="size-3" />
                      </Link>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
