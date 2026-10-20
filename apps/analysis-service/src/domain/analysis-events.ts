import type { AnalysisType } from "./analysis-type.js";

export interface AnalysisRequestedEvent {
  name: "AnalysisRequested";
  analysisId: string;
  documentId: string;
  userId: string;
  type: AnalysisType;
}

export type AnalysisDomainEvent = AnalysisRequestedEvent;
