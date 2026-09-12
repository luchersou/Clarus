import { Inject, Injectable } from "@nestjs/common";
import { Document } from "../domain/document.entity.js";
import type { FileType } from "../domain/file-type.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "../domain/document.repository.js";
import {
  FILE_STORAGE,
  type FileStoragePort,
} from "./ports/file-storage.port.js";
import {
  DOCUMENT_EVENT_PUBLISHER,
  type DocumentEventPublisherPort,
} from "./ports/document-event-publisher.port.js";

export interface UploadDocumentInput {
  userId: string;
  fileName: string;
  fileType: FileType;
  file: Buffer;
}

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStoragePort,
    @Inject(DOCUMENT_EVENT_PUBLISHER)
    private readonly eventPublisher: DocumentEventPublisherPort,
  ) {}

  async execute(input: UploadDocumentInput): Promise<Document> {
    const storageUrl = `${input.userId}/${Date.now()}-${input.fileName}`;

    await this.fileStorage.upload({ path: storageUrl, file: input.file });

    const document = Document.create({
      userId: input.userId,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSizeBytes: input.file.length,
      storageUrl,
    });

    await this.documentRepository.save(document);

    this.eventPublisher.publishDocumentUploaded({
      documentId: document.id,
      userId: document.userId,
      storageUrl: document.storageUrl,
      fileType: document.fileType,
    });

    return document;
  }
}