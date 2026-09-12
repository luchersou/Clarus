import { Injectable } from "@nestjs/common";
import { Document } from "../../domain/document.entity.js";
import type { DocumentRepository } from "../../domain/document.repository.js";
import { PrismaService } from "./prisma.service.js";
import type { Document as PrismaDocument } from "../../../prisma/generated/prisma/client.js";

@Injectable()
export class DocumentPrismaRepository implements DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(document: Document): Promise<void> {
    const data = this.toPersistence(document);

    await this.prisma.document.upsert({
      where: { id: document.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Document | null> {
    const record = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string): Promise<Document[]> {
    const records = await this.prisma.document.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toPersistence(document: Document) {
    return {
      id: document.id,
      userId: document.userId,
      fileName: document.fileName,
      fileType: document.fileType,
      fileSizeBytes: document.fileSizeBytes,
      storageUrl: document.storageUrl,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.isDeleted ? document.deletedAt : null,
    };
  }

  private toDomain(record: PrismaDocument): Document {
    return Document.reconstruct({
      id: record.id,
      userId: record.userId,
      fileName: record.fileName,
      fileType: record.fileType,
      fileSizeBytes: record.fileSizeBytes,
      storageUrl: record.storageUrl,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}