import { Inject, Injectable, Logger } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";

export interface MarkAnalysisCompletedInput {
  analysisId: string;
  result: Record<string, unknown>;
  sourcePage?: number;
  confidence?: number;
}

@Injectable()
export class MarkAnalysisCompletedUseCase {
  private readonly logger = new Logger(MarkAnalysisCompletedUseCase.name);

  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: MarkAnalysisCompletedInput): Promise<void> {
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

    analysis.markAsCompleted({
      result: input.result,
      sourcePage: input.sourcePage,
      confidence: input.confidence,
    });

    await this.analysisRepository.save(analysis);
  }
}