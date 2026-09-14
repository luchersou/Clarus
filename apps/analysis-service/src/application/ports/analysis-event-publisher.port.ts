import type { AnalysisType } from "../../domain/analysis-type.js";

export interface AnalysisRequestedPayload {
  analysisId: string;
  documentId: string;
  userId: string;
  type: AnalysisType;
}

export interface AnalysisEventPublisherPort {
  publishAnalysisRequested(payload: AnalysisRequestedPayload): void;
}

export const ANALYSIS_EVENT_PUBLISHER = Symbol("ANALYSIS_EVENT_PUBLISHER");