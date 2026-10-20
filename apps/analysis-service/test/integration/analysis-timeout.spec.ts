import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  ANALYSIS_TIMEOUT_REASON,
  ExpireStaleAnalysesUseCase,
} from "../../src/application/expire-stale-analyses.use-case.js";
import {
  ANALYSIS_REPOSITORY,
  type AnalysisRepository,
} from "../../src/domain/analysis.repository.js";
import { AnalysisConcurrencyError } from "../../src/domain/errors/analysis-concurrency.error.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { createApp } from "../support/create-app.js";

const USER_A = "11111111-1111-4111-8111-111111111111";
const MINUTE = 60_000;

describe("analysis timeout (Real Postgres)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let repository: AnalysisRepository;
  let expireStale: ExpireStaleAnalysesUseCase;

  const insertAnalysis = (status: "PENDING" | "COMPLETED" | "FAILED", ageMs: number) =>
    prisma.analysis.create({
      data: {
        id: randomUUID(),
        documentId: randomUUID(),
        userId: USER_A,
        type: "SUMMARY",
        status,
        createdAt: new Date(Date.now() - ageMs),
      },
    });

  const statusOf = async (id: string) =>
    (await prisma.analysis.findUniqueOrThrow({ where: { id } })).status;

  beforeAll(async () => {
    app = await createApp();
    prisma = app.get(PrismaService);
    repository = app.get<AnalysisRepository>(ANALYSIS_REPOSITORY);
    expireStale = app.get(ExpireStaleAnalysesUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.outboxEvent.deleteMany();
    await prisma.analysis.deleteMany();
  });

  it("fails PENDING analyses created before the cutoff and stores the reason", async () => {
    const stale = await insertAnalysis("PENDING", 15 * MINUTE);

    const expired = await expireStale.execute({ createdBefore: new Date(Date.now() - 10 * MINUTE) });

    expect(expired).toBe(1);
    const row = await prisma.analysis.findUniqueOrThrow({ where: { id: stale.id } });
    expect(row.status).toBe("FAILED");
    expect(row.failureReason).toBe(ANALYSIS_TIMEOUT_REASON);
  });

  it("leaves recent PENDING analyses and finished ones untouched", async () => {
    const recent = await insertAnalysis("PENDING", 1 * MINUTE);
    const completed = await insertAnalysis("COMPLETED", 15 * MINUTE);
    const failed = await insertAnalysis("FAILED", 15 * MINUTE);

    const expired = await expireStale.execute({ createdBefore: new Date(Date.now() - 10 * MINUTE) });

    expect(expired).toBe(0);
    expect(await statusOf(recent.id)).toBe("PENDING");
    expect(await statusOf(completed.id)).toBe("COMPLETED");
    expect(await statusOf(failed.id)).toBe("FAILED");
  });

  it("ignores soft-deleted analyses", async () => {
    const deleted = await insertAnalysis("PENDING", 15 * MINUTE);
    await prisma.analysis.update({ where: { id: deleted.id }, data: { deletedAt: new Date() } });

    const expired = await expireStale.execute({ createdBefore: new Date(Date.now() - 10 * MINUTE) });

    expect(expired).toBe(0);
    expect(await statusOf(deleted.id)).toBe("PENDING");
  });

  it("does not overwrite a result that arrived after the analysis was loaded", async () => {
    const row = await insertAnalysis("PENDING", 15 * MINUTE);

    const forTimeout = await repository.findById(row.id);
    const forResult = await repository.findById(row.id);

    forResult!.markAsCompleted({ result: { content: "done" } });
    await repository.save(forResult!);

    forTimeout!.markAsFailed(ANALYSIS_TIMEOUT_REASON);
    await expect(repository.save(forTimeout!)).rejects.toBeInstanceOf(AnalysisConcurrencyError);

    expect(await statusOf(row.id)).toBe("COMPLETED");
  });
});
