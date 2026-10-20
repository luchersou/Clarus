export class AnalysisQuotaExceededError extends Error {
  constructor(readonly dailyLimit: number) {
    super(`Daily analysis limit of ${dailyLimit} reached. Try again tomorrow.`);
    this.name = "AnalysisQuotaExceededError";
  }
}
