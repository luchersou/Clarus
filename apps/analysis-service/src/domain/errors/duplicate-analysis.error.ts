import type { AnalysisType } from "../analysis-type.js";

export class DuplicateAnalysisError extends Error {
  constructor(documentId: string, type: AnalysisType) {
    super(`An analysis of type ${type} is already running for document ${documentId}`);
    this.name = "DuplicateAnalysisError";
  }
}
