export class AnalysisConcurrencyError extends Error {
  constructor(analysisId: string) {
    super(`Analysis ${analysisId} changed status since it was loaded`);
    this.name = "AnalysisConcurrencyError";
  }
}
