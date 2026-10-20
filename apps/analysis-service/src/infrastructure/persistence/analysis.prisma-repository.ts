import { Injectable } from "@nestjs/common";
import { AnalysisRequestedSchema, ROUTING_KEYS } from "@clarus/event-contracts";
import { PrismaService } from "./prisma.service.js";
import { Analysis } from "../../domain/analysis.entity.js";
import type { AnalysisRepository } from "../../domain/analysis.repository.js";
import type { AnalysisDomainEvent } from "../../domain/analysis-events.js";
import type { AnalysisType } from "../../domain/analysis-type.js";
import { AnalysisConcurrencyError } from "../../domain/errors/analysis-concurrency.error.js";
import { Prisma } from "./generated/prisma/client.js";
import type { Analysis as PrismaAnalysis } from "./generated/prisma/client.js"; 

@Injectable()
export class AnalysisPrismaRepository implements AnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(analysis: Analysis): Promise<void> {
    const data = this.toPersistence(analysis);
    const outboxEvents = analysis.pullEvents().map((event) => this.toOutboxEvent(event));

    const persistedStatus = analysis.persistedStatus;

    // the analysis and its events are stored atomically; OutboxRelay publishes the events
    await this.prisma.$transaction(async (tx) => {
      if (persistedStatus === null) {
        await tx.analysis.create({ data });
      } else {
        // optimistic check: someone else may have moved the status since it was loaded
        const { count } = await tx.analysis.updateMany({
          where: { id: analysis.id, status: persistedStatus },
          data,
        });
        if (count === 0) throw new AnalysisConcurrencyError(analysis.id);
      }

      if (outboxEvents.length > 0) {
        await tx.outboxEvent.createMany({ data: outboxEvents });
      }
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

  async hasPending(userId: string, documentId: string, type: AnalysisType): Promise<boolean> {
    const count = await this.prisma.analysis.count({
      where: { userId, documentId, type, status: "PENDING", deletedAt: null },
    });
    return count > 0;
  }

  async findPendingCreatedBefore(cutoff: Date, limit: number): Promise<Analysis[]> {
    const records = await this.prisma.analysis.findMany({
      where: { status: "PENDING", deletedAt: null, createdAt: { lt: cutoff } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return records.map((record) => this.toDomain(record));
  }

  async countCreditsInUse(userId: string, since: Date): Promise<number> {
    return this.prisma.analysis.count({
      where: {
        userId,
        createdAt: { gte: since },
        creditStatus: { in: ["RESERVED", "CONSUMED"] },
      },
    });
  }

  private toPersistence(analysis: Analysis): Prisma.AnalysisUncheckedCreateInput {
		return {
			id: analysis.id,
			documentId: analysis.documentId,
			userId: analysis.userId,
			type: analysis.type as Prisma.AnalysisUncheckedCreateInput["type"],
			status: analysis.status as Prisma.AnalysisUncheckedCreateInput["status"],
			creditStatus: analysis.creditStatus,
			result: (analysis.result ?? Prisma.JsonNull) as Prisma.InputJsonValue,
			sourcePage: analysis.sourcePage,
			confidence: analysis.confidence,
			failureReason: analysis.failureReason,
			createdAt: analysis.createdAt,
			updatedAt: analysis.updatedAt,
			deletedAt: analysis.isDeleted ? analysis.deletedAt : null,
		};
	}

  private toOutboxEvent(event: AnalysisDomainEvent): Prisma.OutboxEventCreateManyInput {
    switch (event.name) {
      case "AnalysisRequested":
        return {
          routingKey: ROUTING_KEYS.ANALYSIS_REQUESTED,
          payload: AnalysisRequestedSchema.parse({
            analysisId: event.analysisId,
            documentId: event.documentId,
            userId: event.userId,
            type: event.type,
          }),
        };
    }
  }

  private toDomain(record: PrismaAnalysis): Analysis {
    return Analysis.reconstruct({
      id: record.id,
      documentId: record.documentId,
      userId: record.userId,
      type: record.type as Analysis["type"],
      status: record.status as Analysis["status"],
      creditStatus: record.creditStatus,
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