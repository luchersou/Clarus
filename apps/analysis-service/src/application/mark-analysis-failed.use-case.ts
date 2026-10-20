import { Inject, Injectable, Logger } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import { AnalysisConcurrencyError } from "../domain/errors/analysis-concurrency.error.js";

export interface MarkAnalysisFailedInput {
  analysisId: string;
  reason: string;
}

@Injectable()
export class MarkAnalysisFailedUseCase {
  private readonly logger = new Logger(MarkAnalysisFailedUseCase.name);

  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: MarkAnalysisFailedInput): Promise<void> {
    const analysis = await this.analysisRepository.findById(input.analysisId);

    if (!analysis) {
      this.logger.warn(
        `Analysis ${input.analysisId} not found — may have been deleted before the event arrived`,
      );
      return;
    }

    if (analysis.status !== "PENDING") {
      this.logger.warn(
        `Analysis ${input.analysisId} is already in status "${analysis.status}" — ignoring duplicate event`,
      );
      return;
    }

    analysis.markAsFailed(input.reason);

    try {
      await this.analysisRepository.save(analysis);
    } catch (error) {
      if (!(error instanceof AnalysisConcurrencyError)) throw error;
      this.logger.warn(
        `Analysis ${input.analysisId} changed status concurrently — ignoring analysis.failed`,
      );
    }
  }
}