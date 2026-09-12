import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Document } from "../domain/document.entity.js";
import { DOCUMENT_REPOSITORY, type DocumentRepository } from "../domain/document.repository.js";

export interface GetDocumentInput {
  documentId: string;
  userId: string;
}

@Injectable()
export class GetDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(input: GetDocumentInput): Promise<Document> {
    const document = await this.documentRepository.findById(input.documentId);

    if (!document || document.userId !== input.userId) {
      throw new NotFoundException(`Document ${input.documentId} not found`);
    }

    return document;
  }
}