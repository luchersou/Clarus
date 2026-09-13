import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { Analysis } from "../../domain/analysis.entity.js";
import type { AnalysisRepository } from "../../domain/analysis.repository.js";
import { Prisma } from "../../../prisma/generated/prisma/client.js";
import type { Analysis as PrismaAnalysis } from "../../../prisma/generated/prisma/client.js"; 

@Injectable()
export class AnalysisPrismaRepository implements AnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(analysis: Analysis): Promise<void> {
    const data = this.toPersistence(analysis);

    await this.prisma.analysis.upsert({
      where: { id: analysis.id },
      create: data,
      update: data,
    });
  }

  async findById(analysisId: string): Promise<Analysis | null> {
    const record = await this.prisma.analysis.findFirst({
      where: { id: analysisId, deletedAt: null },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUserId(userId: string, documentId?: string): Promise<Analysis[]> {
    const records = await this.prisma.analysis.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(documentId && { documentId }),
      },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toPersistence(analysis: Analysis): Prisma.AnalysisUncheckedCreateInput {
		return {
			id: analysis.id,
			documentId: analysis.documentId,
			userId: analysis.userId,
			type: analysis.type as Prisma.AnalysisUncheckedCreateInput["type"],
			status: analysis.status as Prisma.AnalysisUncheckedCreateInput["status"],
			result: (analysis.result ?? Prisma.JsonNull) as Prisma.InputJsonValue,
			sourcePage: analysis.sourcePage,
			confidence: analysis.confidence,
			failureReason: analysis.failureReason,
			createdAt: analysis.createdAt,
			updatedAt: analysis.updatedAt,
			deletedAt: analysis.isDeleted ? analysis.deletedAt : null,
		};
	}

  private toDomain(record: PrismaAnalysis): Analysis {
    return Analysis.reconstruct({
      id: record.id,
      documentId: record.documentId,
      userId: record.userId,
      type: record.type as Analysis["type"],
      status: record.status as Analysis["status"],
      result: (record.result as Record<string, unknown> | null) ?? null,
      sourcePage: record.sourcePage,
      confidence: record.confidence,
      failureReason: record.failureReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}