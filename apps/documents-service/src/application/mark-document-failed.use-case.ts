import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "../domain/document.repository.js";

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
      throw new NotFoundException(`Document ${input.documentId} not found`);
    }

    document.markAsFailed();
    await this.documentRepository.save(document);
  }
}