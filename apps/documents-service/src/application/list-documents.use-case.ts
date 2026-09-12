import { Inject, Injectable } from "@nestjs/common";
import { Document } from "../domain/document.entity.js";
import { DOCUMENT_REPOSITORY, type DocumentRepository } from "../domain/document.repository.js";

export interface ListDocumentsInput {
  userId: string;
}

@Injectable()
export class ListDocumentsUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY) private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(input: ListDocumentsInput): Promise<Document[]> {
    return this.documentRepository.findByUserId(input.userId);
  }
}