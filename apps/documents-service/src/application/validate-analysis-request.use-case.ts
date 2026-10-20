import { Inject, Injectable } from "@nestjs/common";
import { DOCUMENT_REPOSITORY, type DocumentRepository } from "../domain/document.repository.js";
import {
  DOCUMENT_EVENT_PUBLISHER,
  type AnalysisDocumentValidatedPayload,
  type DocumentEventPublisherPort,
} from "./ports/document-event-publisher.port.js";

export type ValidateAnalysisRequestInput = AnalysisDocumentValidatedPayload;

export const DOCUMENT_NOT_FOUND_REASON = "The document no longer exists.";
export const DOCUMENT_NOT_READY_REASON = "The document hasn't finished processing yet.";
export const DOCUMENT_FAILED_REASON = "The document couldn't be processed, so it can't be analyzed.";

/**
 * Saga step owned by documents-service: an analysis may only run on a document
 * that exists, belongs to the requesting user and has finished processing.
 * Replies with analysis.document_validated or analysis.rejected.
 */
@Injectable()
export class ValidateAnalysisRequestUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
    @Inject(DOCUMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: DocumentEventPublisherPort,
  ) {}

  async execute(input: ValidateAnalysisRequestInput): Promise<void> {
    const reason = await this.rejectionReason(input);

    if (reason) {
      await this.eventPublisher.publishAnalysisRejected({ analysisId: input.analysisId, reason });
      return;
    }

    await this.eventPublisher.publishAnalysisDocumentValidated(input);
  }

  private async rejectionReason(input: ValidateAnalysisRequestInput): Promise<string | null> {
    const document = await this.documentRepository.findById(input.documentId);

    // another user's document is reported as missing, so its existence isn't revealed
    if (!document || document.userId !== input.userId) return DOCUMENT_NOT_FOUND_REASON;
    if (document.status === "UPLOADED") return DOCUMENT_NOT_READY_REASON;
    if (document.status === "FAILED") return DOCUMENT_FAILED_REASON;
    return null;
  }
}
