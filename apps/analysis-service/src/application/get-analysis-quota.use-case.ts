import { Inject, Injectable } from "@nestjs/common";
import { ANALYSIS_REPOSITORY, type AnalysisRepository } from "../domain/analysis.repository.js";
import { ANALYSIS_QUOTA_POLICY, type AnalysisQuotaPolicy, quotaWindow } from "./analysis-quota.js";

export interface AnalysisQuota {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: Date;
}

@Injectable()
export class GetAnalysisQuotaUseCase {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analysisRepository: AnalysisRepository,
    @Inject(ANALYSIS_QUOTA_POLICY)
    private readonly quotaPolicy: AnalysisQuotaPolicy,
  ) {}

  async execute(input: { userId: string }): Promise<AnalysisQuota> {
    const { start, end } = quotaWindow(new Date());
    const used = await this.analysisRepository.countCreditsInUse(input.userId, start);
    const limit = this.quotaPolicy.dailyLimit;

    return { used, limit, remaining: Math.max(limit - used, 0), resetsAt: end };
  }
}
