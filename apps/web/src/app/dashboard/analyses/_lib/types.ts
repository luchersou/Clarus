import { CalendarClock, FileSearch, GitCompare, ListChecks } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AnalysisType = "SUMMARY" | "EXTRACT_VALUES" | "DEADLINES" | "COMPARE";
export type AnalysisStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Analysis {
  id: string;
  documentId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  result: { content: string } | null;
  failureReason: string | null;
  createdAt: string;
}

export const ANALYSIS_TYPES: {
  type: AnalysisType;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    type: "SUMMARY",
    label: "Summary",
    description: "A concise overview of the document's key points.",
    icon: FileSearch,
  },
  {
    type: "EXTRACT_VALUES",
    label: "Extract values",
    description: "Pull out amounts, names, and key figures.",
    icon: ListChecks,
  },
  {
    type: "DEADLINES",
    label: "Deadlines",
    description: "Find due dates and time-sensitive terms.",
    icon: CalendarClock,
  },
  {
    type: "COMPARE",
    label: "Comparison",
    description: "Contrast sections, terms, or figures within the document.",
    icon: GitCompare,
  },
];

export const ANALYSIS_TYPE_CONFIG = Object.fromEntries(
  ANALYSIS_TYPES.map((item) => [item.type, item]),
) as Record<AnalysisType, (typeof ANALYSIS_TYPES)[number]>;
