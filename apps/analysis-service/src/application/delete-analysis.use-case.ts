import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";

export interface DeleteAnalysisInput {
  analysisId: string;
  userId: string;
}

@Injectable()
export class DeleteAnalysisUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: DeleteAnalysisInput): Promise<void> {
    const analysis = await this.analysisRepository.findById(input.analysisId);

    if (!analysis || analysis.userId !== input.userId) {
      throw new NotFoundException(`Analysis ${input.analysisId} not found`);
    }

    analysis.delete();
    await this.analysisRepository.save(analysis);
  }
}