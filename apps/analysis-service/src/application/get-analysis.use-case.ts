import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Analysis } from "../domain/analysis.entity.js";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";

export interface GetAnalysisInput {
  analysisId: string;
  userId: string;
}

@Injectable()
export class GetAnalysisUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: GetAnalysisInput): Promise<Analysis> {
    const analysis = await this.analysisRepository.findById(input.analysisId);

    if (!analysis || analysis.userId !== input.userId) {
      throw new NotFoundException(`Analysis ${input.analysisId} not found`);
    }

    return analysis;
  }
}