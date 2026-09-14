import type { Analysis } from "../domain/analysis.entity.js";

export class AnalysisResponseMapper {
  static toHttp(analysis: Analysis) {
    return {
      id: analysis.id,
      documentId: analysis.documentId,
      type: analysis.type,
      status: analysis.status,
      result: analysis.result,
      sourcePage: analysis.sourcePage,
      confidence: analysis.confidence,
      failureReason: analysis.failureReason,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  }
}