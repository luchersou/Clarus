import type { AnalysisStatus } from "../analysis-status.js";

export class InvalidAnalysisTransitionError extends Error {
  constructor(from: AnalysisStatus, to: AnalysisStatus) {
    super(`Cannot transition analysis from "${from}" to "${to}"`);
    this.name = "InvalidAnalysisTransitionError";
  }
}