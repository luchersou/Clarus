import { Inject, Injectable } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import { AnalysisConcurrencyError } from "../domain/errors/analysis-concurrency.error.js";

export interface DeleteDocumentAnalysesInput {
  documentId: string;
  userId: string;
}

const MAX_ATTEMPTS = 3;

/** Reacts to document.deleted: the document's analyses go with it. */
@Injectable()
export class DeleteDocumentAnalysesUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: DeleteDocumentAnalysesInput): Promise<void> {
    const analyses = await this.analysisRepository.findByUserId(input.userId, input.documentId);

    for (const { id } of analyses) {
      await this.deleteWithRetry(id);
    }
  }

  // a result may land while deleting; reload and try again so the analysis is still removed
  private async deleteWithRetry(analysisId: string): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      const analysis = await this.analysisRepository.findById(analysisId);
      if (!analysis) return;

      analysis.delete();
      try {
        await this.analysisRepository.save(analysis);
        return;
      } catch (error) {
        if (!(error instanceof AnalysisConcurrencyError) || attempt >= MAX_ATTEMPTS) throw error;
      }
    }
  }
}
