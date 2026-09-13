import { Inject, Injectable } from "@nestjs/common";
import { Analysis } from "../domain/analysis.entity.js";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";

export interface ListAnalysesInput {
  userId: string;
  documentId?: string;
}

@Injectable()
export class ListAnalysesUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
  ) {}

  async execute(input: ListAnalysesInput): Promise<Analysis[]> {
    return this.analysisRepository.findByUserId(input.userId, input.documentId);
  }
}