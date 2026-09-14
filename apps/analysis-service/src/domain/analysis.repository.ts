import type { Analysis } from "./analysis.entity.js";

export interface AnalysisRepository {
  save(analysis: Analysis): Promise<void>;
  findById(analysisId: string): Promise<Analysis | null>;
  findByUserId(userId: string, documentId?: string): Promise<Analysis[]>;
}

export const ANALYSIS_REPOSITORY = Symbol("ANALYSIS_REPOSITORY");