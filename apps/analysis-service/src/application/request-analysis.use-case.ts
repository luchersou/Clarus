import { Inject, Injectable } from "@nestjs/common";
import { Analysis } from "../domain/analysis.entity.js";
import type { AnalysisType } from "../domain/analysis-type.js";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import { AnalysisQuotaExceededError } from "../domain/errors/analysis-quota-exceeded.error.js";
import { DuplicateAnalysisError } from "../domain/errors/duplicate-analysis.error.js";
import { ANALYSIS_QUOTA_POLICY, type AnalysisQuotaPolicy, quotaWindow } from "./analysis-quota.js";

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
    @Inject(ANALYSIS_QUOTA_POLICY)
    private readonly quotaPolicy: AnalysisQuotaPolicy,
  ) {}

  async execute(input: RequestAnalysisInput): Promise<Analysis> {
    if (await this.analysisRepository.hasPending(input.userId, input.documentId, input.type)) {
      throw new DuplicateAnalysisError(input.documentId, input.type);
    }

    // Soft limit: two requests racing at the very last credit can both pass.
    const { start } = quotaWindow(new Date());
    const used = await this.analysisRepository.countCreditsInUse(input.userId, start);
    if (used >= this.quotaPolicy.dailyLimit) {
      throw new AnalysisQuotaExceededError(this.quotaPolicy.dailyLimit);
    }

    // the new analysis reserves one credit
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