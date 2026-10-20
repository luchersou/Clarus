import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DOCUMENT_REPOSITORY, type DocumentRepository } from "../domain/document.repository.js";
import {
  DOCUMENT_EVENT_PUBLISHER,
  type DocumentEventPublisherPort,
} from "./ports/document-event-publisher.port.js";

export interface DeleteDocumentInput {
  documentId: string;
  userId: string;
}

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
    @Inject(DOCUMENT_EVENT_PUBLISHER) private readonly eventPublisher: DocumentEventPublisherPort,
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const document = await this.documentRepository.findById(input.documentId);

    if (!document || document.userId !== input.userId) {
      throw new NotFoundException(`Document ${input.documentId} not found`);
    }

    document.delete();
    await this.documentRepository.save(document);

    // analysis-service removes the document's analyses
    await this.eventPublisher.publishDocumentDeleted({
      documentId: document.id,
      userId: document.userId,
    });
  }
}