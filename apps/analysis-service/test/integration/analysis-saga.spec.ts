import { randomUUID } from "node:crypto";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { INestApplication } from "@nestjs/common";
import { EXCHANGES, ROUTING_KEYS, RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ExpireStaleAnalysesUseCase } from "../../src/application/expire-stale-analyses.use-case.js";
import { MarkAnalysisCompletedUseCase } from "../../src/application/mark-analysis-completed.use-case.js";
import { MarkAnalysisFailedUseCase } from "../../src/application/mark-analysis-failed.use-case.js";
import { RequestAnalysisUseCase } from "../../src/application/request-analysis.use-case.js";
import { AnalysisQuotaExceededError } from "../../src/domain/errors/analysis-quota-exceeded.error.js";
import { DuplicateAnalysisError } from "../../src/domain/errors/duplicate-analysis.error.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { createApp } from "../support/create-app.js";
import { waitFor } from "../support/wait-for.js";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const DAILY_LIMIT = 3;

describe("analysis saga in analysis-service (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let amqp: AmqpConnection;
  let prisma: PrismaService;
  let requestAnalysis: RequestAnalysisUseCase;
  let markCompleted: MarkAnalysisCompletedUseCase;
  let markFailed: MarkAnalysisFailedUseCase;

  const request = (
    documentId = randomUUID(),
    type: "SUMMARY" | "DEADLINES" | "COMPARE" | "EXTRACT_VALUES" = "SUMMARY",
    userId = USER_A,
  ) => requestAnalysis.execute({ documentId, userId, type });

  const rowOf = (id: string) => prisma.analysis.findUniqueOrThrow({ where: { id } });

  const rpc = (routingKey: string, payload: unknown) =>
    amqp.request<Record<string, unknown>>({
      exchange: EXCHANGES.RPC,
      routingKey,
      payload,
      timeout: 10_000,
    });

  beforeAll(async () => {
    app = await createApp({ ANALYSIS_DAILY_LIMIT: String(DAILY_LIMIT) });
    amqp = app.get(AmqpConnection);
    prisma = app.get(PrismaService);
    requestAnalysis = app.get(RequestAnalysisUseCase);
    markCompleted = app.get(MarkAnalysisCompletedUseCase);
    markFailed = app.get(MarkAnalysisFailedUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.outboxEvent.deleteMany();
    await prisma.analysis.deleteMany();
  });

  describe("quota", () => {
    it("a new analysis reserves a credit, consumed when it completes", async () => {
      const analysis = await request();
      expect((await rowOf(analysis.id)).creditStatus).toBe("RESERVED");

      await markCompleted.execute({ analysisId: analysis.id, result: { content: "ok" } });
      expect((await rowOf(analysis.id)).creditStatus).toBe("CONSUMED");
    });

    it("refuses a request once the daily limit is used", async () => {
      for (let i = 0; i < DAILY_LIMIT; i++) await request();

      await expect(request()).rejects.toBeInstanceOf(AnalysisQuotaExceededError);
      expect(await prisma.analysis.count()).toBe(DAILY_LIMIT);
    });

    it("refunds the credit of a failed analysis (compensation)", async () => {
      const analyses = [];
      for (let i = 0; i < DAILY_LIMIT; i++) analyses.push(await request());

      await markFailed.execute({ analysisId: analyses[0].id, reason: "LLM error" });

      expect((await rowOf(analyses[0].id)).creditStatus).toBe("REFUNDED");
      await expect(request()).resolves.toBeDefined();
    });

    it("refunds the credit of an analysis that timed out", async () => {
      const analysis = await request();

      await app.get(ExpireStaleAnalysesUseCase).execute({ createdBefore: new Date(Date.now() + 1000) });

      const row = await rowOf(analysis.id);
      expect(row.status).toBe("FAILED");
      expect(row.creditStatus).toBe("REFUNDED");
    });

    it("keeps a consumed credit when the analysis is deleted", async () => {
      const analyses = [];
      for (let i = 0; i < DAILY_LIMIT; i++) analyses.push(await request());
      await markCompleted.execute({ analysisId: analyses[0].id, result: { content: "ok" } });

      await rpc(RPC_ROUTING_KEYS.ANALYSES_DELETE, { analysisId: analyses[0].id, userId: USER_A });

      await expect(request()).rejects.toBeInstanceOf(AnalysisQuotaExceededError);
    });

    it("counts each user separately", async () => {
      for (let i = 0; i < DAILY_LIMIT; i++) await request();

      await expect(request(randomUUID(), "SUMMARY", USER_B)).resolves.toBeDefined();
    });

    it("analyses.quota reports usage over RPC", async () => {
      await request();
      const failed = await request();
      await markFailed.execute({ analysisId: failed.id, reason: "LLM error" });

      const quota = await rpc(RPC_ROUTING_KEYS.ANALYSES_QUOTA, { userId: USER_A });

      expect(quota).toMatchObject({ used: 1, limit: DAILY_LIMIT, remaining: DAILY_LIMIT - 1 });
      expect(new Date(quota.resetsAt as string).getTime()).toBeGreaterThan(Date.now());
    });

    it("analyses.request answers QUOTA_EXCEEDED over RPC", async () => {
      for (let i = 0; i < DAILY_LIMIT; i++) await request();

      const reply = await rpc(RPC_ROUTING_KEYS.ANALYSES_REQUEST, {
        documentId: randomUUID(),
        userId: USER_A,
        type: "SUMMARY",
      });

      expect(reply.error).toBe("QUOTA_EXCEEDED");
    });
  });

  describe("duplicates", () => {
    it("refuses a second pending analysis of the same type for the same document", async () => {
      const documentId = randomUUID();
      await request(documentId, "SUMMARY");

      await expect(request(documentId, "SUMMARY")).rejects.toBeInstanceOf(DuplicateAnalysisError);
      await expect(request(documentId, "DEADLINES")).resolves.toBeDefined();
    });

    it("allows the same analysis again once the previous one finished", async () => {
      const documentId = randomUUID();
      const first = await request(documentId, "SUMMARY");
      await markFailed.execute({ analysisId: first.id, reason: "LLM error" });

      await expect(request(documentId, "SUMMARY")).resolves.toBeDefined();
    });

    it("analyses.request answers CONFLICT over RPC", async () => {
      const documentId = randomUUID();
      await request(documentId, "SUMMARY");

      const reply = await rpc(RPC_ROUTING_KEYS.ANALYSES_REQUEST, {
        documentId,
        userId: USER_A,
        type: "SUMMARY",
      });

      expect(reply.error).toBe("CONFLICT");
    });
  });

  describe("events from documents-service", () => {
    it("analysis.rejected fails the analysis with the reason and refunds its credit", async () => {
      const analysis = await request();

      await amqp.publish(EXCHANGES.EVENTS, ROUTING_KEYS.ANALYSIS_REJECTED, {
        analysisId: analysis.id,
        reason: "The document no longer exists.",
      });

      const row = await waitFor(
        async () => {
          const found = await rowOf(analysis.id);
          return found.status === "FAILED" ? found : null;
        },
        { message: "analysis to become FAILED" },
      );
      expect(row.failureReason).toBe("The document no longer exists.");
      expect(row.creditStatus).toBe("REFUNDED");
    });

    it("document.deleted deletes that document's analyses only", async () => {
      const documentId = randomUUID();
      const pending = await request(documentId, "SUMMARY");
      const completed = await request(documentId, "DEADLINES");
      await markCompleted.execute({ analysisId: completed.id, result: { content: "ok" } });
      const otherDocument = await request();

      await amqp.publish(EXCHANGES.EVENTS, ROUTING_KEYS.DOCUMENT_DELETED, {
        documentId,
        userId: USER_A,
      });

      await waitFor(
        async () => {
          const rows = await prisma.analysis.findMany({ where: { documentId, deletedAt: null } });
          return rows.length === 0;
        },
        { message: "the document's analyses to be deleted" },
      );

      // the pending one never ran, so its credit comes back; the completed one stays consumed
      expect((await rowOf(pending.id)).creditStatus).toBe("REFUNDED");
      expect((await rowOf(completed.id)).creditStatus).toBe("CONSUMED");
      expect((await rowOf(otherDocument.id)).deletedAt).toBeNull();
    });

    it("document.deleted ignores another user's analyses", async () => {
      const documentId = randomUUID();
      const theirs = await request(documentId, "SUMMARY", USER_B);
      const sentinelDocument = randomUUID();
      const sentinel = await request(sentinelDocument, "SUMMARY", USER_A);

      await amqp.publish(EXCHANGES.EVENTS, ROUTING_KEYS.DOCUMENT_DELETED, {
        documentId,
        userId: USER_A,
      });
      // events on the same queue are handled in order, so once the sentinel is gone the first was handled
      await amqp.publish(EXCHANGES.EVENTS, ROUTING_KEYS.DOCUMENT_DELETED, {
        documentId: sentinelDocument,
        userId: USER_A,
      });
      await waitFor(async () => (await rowOf(sentinel.id)).deletedAt !== null, {
        message: "the sentinel analysis to be deleted",
      });

      expect((await rowOf(theirs.id)).deletedAt).toBeNull();
    });
  });
});
