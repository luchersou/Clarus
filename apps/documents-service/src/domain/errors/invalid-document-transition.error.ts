import type { DocumentStatus } from "../document-status.js";

export class InvalidDocumentTransitionError extends Error {
  constructor(from: DocumentStatus, to: DocumentStatus) {
    super(`Cannot transition document from "${from}" to "${to}"`);
    this.name = "InvalidDocumentTransitionError";
  }
}