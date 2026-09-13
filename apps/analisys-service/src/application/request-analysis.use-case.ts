import { Inject, Injectable } from "@nestjs/common";
import { Analysis } from "../domain/analysis.entity.js";
import type { AnalysisType } from "../domain/analysis-type.js";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import {
  ANALYSIS_EVENT_PUBLISHER,
  type AnalysisEventPublisherPort,
} from "./ports/analysis-event-publisher.port.js";

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
    @Inject(ANALYSIS_EVENT_PUBLISHER)
    private readonly eventPublisher: AnalysisEventPublisherPort,
  ) {}

  async execute(input: RequestAnalysisInput): Promise<Analysis> {
    const analysis = Analysis.create({
      documentId: input.documentId,
      userId: input.userId,
      type: input.type,
    });

    await this.analysisRepository.save(analysis);

    this.eventPublisher.publishAnalysisRequested({
      analysisId: analysis.id,
      documentId: analysis.documentId,
      userId: analysis.userId,
      type: analysis.type,
    });

    return analysis;
  }
}