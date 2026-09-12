import type { Document } from "./document.entity.js";

export interface DocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findByUserId(userId: string): Promise<Document[]>;
}

export const DOCUMENT_REPOSITORY = Symbol("DOCUMENT_REPOSITORY");