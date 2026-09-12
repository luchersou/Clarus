import type { Document } from "../domain/document.entity.js";

export class DocumentResponseMapper {
  static toHttp(document: Document, url: string) {
    return {
      id: document.id,
      userId: document.userId,
      fileName: document.fileName,
      fileType: document.fileType,
      status: document.status,
      createdAt: document.createdAt,
      url,
    };
  }
}