import { Inject, Injectable, Logger } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import { AnalysisConcurrencyError } from "../domain/errors/analysis-concurrency.error.js";

export const ANALYSIS_TIMEOUT_REASON = "The analysis took too long and was cancelled. Please try again.";

const BATCH_SIZE = 100;

export interface ExpireStaleAnalysesInput {
  createdBefore: Date;
}

/**
 * Saga timeout: an analysis still PENDING after the deadline will never get a
 * reply (lost message, crashed worker), so it is failed instead of waiting forever.
 */
@Injectable()
export class ExpireStaleAnalysesUseCase {
  private readonly logger = new Logger(ExpireStaleAnalysesUseCase.name);

  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  /** Returns how many analyses were failed. */
  async execute(input: ExpireStaleAnalysesInput): Promise<number> {
    const stale = await this.analysisRepository.findPendingCreatedBefore(
      input.createdBefore,
      BATCH_SIZE,
    );

    let expired = 0;
    for (const analysis of stale) {
      analysis.markAsFailed(ANALYSIS_TIMEOUT_REASON);

      try {
        await this.analysisRepository.save(analysis);
        expired++;
      } catch (error) {
        // the result arrived while this ran; the analysis is no longer stale
        if (!(error instanceof AnalysisConcurrencyError)) throw error;
      }
    }

    if (expired > 0) this.logger.warn(`Failed ${expired} analyses that timed out`);
    return expired;
  }
}
