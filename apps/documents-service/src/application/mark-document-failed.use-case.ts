import { Inject, Injectable } from "@nestjs/common";
import { DOCUMENT_REPOSITORY, type DocumentRepository } from "../domain/document.repository.js";

export interface MarkDocumentFailedInput {
  documentId: string;
  reason: string;
}

@Injectable()
export class MarkDocumentFailedUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(input: MarkDocumentFailedInput): Promise<void> {
    const document = await this.documentRepository.findById(input.documentId);

    if (!document) {
      // Document was deleted before the rag-service responded — this is an
      // expected race condition in a choreographed saga, not an error.
      // Silently ignore rather than throwing, since there's no caller waiting
      // on this listener to report back to.
      return;
    }

    document.markAsFailed(input.reason);
    await this.documentRepository.save(document);
  }
}