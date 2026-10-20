export interface AnalysisQuotaPolicy {
  dailyLimit: number;
}

export const ANALYSIS_QUOTA_POLICY = Symbol("ANALYSIS_QUOTA_POLICY");

/** The quota resets every day at midnight UTC. */
export function quotaWindow(now: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
