import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "../domain/document.repository.js";

export interface MarkDocumentProcessedInput {
  documentId: string;
}

@Injectable()
export class MarkDocumentProcessedUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(input: MarkDocumentProcessedInput): Promise<void> {
    const document = await this.documentRepository.findById(input.documentId);

    if (!document) {
      throw new NotFoundException(`Document ${input.documentId} not found`);
    }

    document.markAsProcessed();
    await this.documentRepository.save(document);
  }
}