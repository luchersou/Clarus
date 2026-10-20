import type { Analysis } from "./analysis.entity.js";
import type { AnalysisType } from "./analysis-type.js";

export interface AnalysisRepository {
  save(analysis: Analysis): Promise<void>;
  findById(analysisId: string): Promise<Analysis | null>;
  findByUserId(userId: string, documentId?: string): Promise<Analysis[]>;
  hasPending(userId: string, documentId: string, type: AnalysisType): Promise<boolean>;
  findPendingCreatedBefore(cutoff: Date, limit: number): Promise<Analysis[]>;
  /** Credits RESERVED or CONSUMED by the user's analyses created since `since`, deleted ones included. */
  countCreditsInUse(userId: string, since: Date): Promise<number>;
}

export const ANALYSIS_REPOSITORY = Symbol("ANALYSIS_REPOSITORY");