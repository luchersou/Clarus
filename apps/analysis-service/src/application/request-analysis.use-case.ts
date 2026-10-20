import { Inject, Injectable } from "@nestjs/common";
import { Analysis } from "../domain/analysis.entity.js";
import type { AnalysisType } from "../domain/analysis-type.js";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";

export interface RequestAnalysisInput {
  documentId: string;
  userId: string;
  type: AnalysisType;
}

@Injectable()
export class RequestAnalysisUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: RequestAnalysisInput): Promise<Analysis> {
    const analysis = Analysis.create({
      documentId: input.documentId,
      userId: input.userId,
      type: input.type,
    });

    // saving also stores analysis.requested in the outbox, in the same transaction
    await this.analysisRepository.save(analysis);

    return analysis;
  }
}