import { randomUUID } from "node:crypto";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EXCHANGES, ROUTING_KEYS, RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { connect } from "amqplib";
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { FILE_STORAGE } from "../../src/application/ports/file-storage.port.js";
import {
  DOCUMENT_FAILED_REASON,
  DOCUMENT_NOT_FOUND_REASON,
  DOCUMENT_NOT_READY_REASON,
} from "../../src/application/validate-analysis-request.use-case.js";
import { Document } from "../../src/domain/document.entity.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "../../src/domain/document.repository.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { waitFor } from "../support/wait-for.js";

type Connection = Awaited<ReturnType<typeof connect>>;
type Channel = Awaited<ReturnType<Connection["createChannel"]>>;

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";
const SAGA_PROBE = "test.analysis-saga-probe";

const newDocument = (userId: string, fileName: string) =>
  Document.create({
    userId,
    fileName,
    fileType: "PDF",
    fileSizeBytes: 1024,
    storageUrl: `${userId}/${fileName}`,
  });

describe("analysis saga in documents-service (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let amqp: AmqpConnection;
  let prisma: PrismaService;
  let repository: DocumentRepository;
  let probeConnection: Connection;
  let probe: Channel;

  const requestAnalysis = (documentId: string, userId: string) => {
    const analysisId = randomUUID();
    return amqp
      .publish(EXCHANGES.EVENTS, ROUTING_KEYS.ANALYSIS_REQUESTED, {
        analysisId,
        documentId,
        userId,
        type: "SUMMARY",
      })
      .then(() => analysisId);
  };

  async function takeReply() {
    const message = await probe.get(SAGA_PROBE, { noAck: true });
    return message
      ? { routingKey: message.fields.routingKey, body: JSON.parse(message.content.toString()) }
      : null;
  }

  const waitForReply = () => waitFor(takeReply, { message: "a reply on the events exchange" });

  beforeAll(async () => {
    const databaseUrl = inject("databaseUrl");
    const host = new URL(databaseUrl).hostname;
    if (!["localhost", "127.0.0.1"].includes(host)) {
      throw new Error(`Refusing to run: test database host is "${host}", expected a local container`);
    }

    process.env.DATABASE_URL = databaseUrl;
    process.env.RABBITMQ_URL = inject("rabbitmqUrl");
    process.env.SUPABASE_URL = "http://localhost:54321";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";

    // Imported here: RabbitMQModule.forRoot reads RABBITMQ_URL at load time.
    const { AppModule } = await import("../../src/app.module.js");

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FILE_STORAGE)
      .useValue({}) // the saga never touches storage
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    amqp = app.get(AmqpConnection);
    prisma = app.get(PrismaService);
    repository = app.get<DocumentRepository>(DOCUMENT_REPOSITORY);

    // Stands in for rag-service and analysis-service: captures what documents-service publishes.
    probeConnection = await connect(inject("rabbitmqUrl"));
    probe = await probeConnection.createChannel();
    await probe.assertQueue(SAGA_PROBE, { durable: true });
    for (const routingKey of [
      ROUTING_KEYS.ANALYSIS_DOCUMENT_VALIDATED,
      ROUTING_KEYS.ANALYSIS_REJECTED,
      ROUTING_KEYS.DOCUMENT_DELETED,
    ]) {
      await probe.bindQueue(SAGA_PROBE, EXCHANGES.EVENTS, routingKey);
    }
  });

  afterAll(async () => {
    await probe.close();
    await probeConnection.close();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
    await probe.purgeQueue(SAGA_PROBE);
  });

  it("validates an analysis of the user's processed document", async () => {
    const document = newDocument(USER_A, "contract.pdf");
    document.markAsProcessed();
    await repository.save(document);

    const analysisId = await requestAnalysis(document.id, USER_A);

    const reply = await waitForReply();
    expect(reply.routingKey).toBe(ROUTING_KEYS.ANALYSIS_DOCUMENT_VALIDATED);
    expect(reply.body).toEqual({
      analysisId,
      documentId: document.id,
      userId: USER_A,
      type: "SUMMARY",
    });
  });

  it("rejects an analysis of a document that doesn't exist", async () => {
    const analysisId = await requestAnalysis(randomUUID(), USER_A);

    const reply = await waitForReply();
    expect(reply.routingKey).toBe(ROUTING_KEYS.ANALYSIS_REJECTED);
    expect(reply.body).toEqual({ analysisId, reason: DOCUMENT_NOT_FOUND_REASON });
  });

  it("rejects another user's document as not found", async () => {
    const document = newDocument(USER_B, "theirs.pdf");
    document.markAsProcessed();
    await repository.save(document);

    const analysisId = await requestAnalysis(document.id, USER_A);

    const reply = await waitForReply();
    expect(reply.routingKey).toBe(ROUTING_KEYS.ANALYSIS_REJECTED);
    expect(reply.body).toEqual({ analysisId, reason: DOCUMENT_NOT_FOUND_REASON });
  });

  it("rejects a document that is still processing", async () => {
    const document = newDocument(USER_A, "uploading.pdf");
    await repository.save(document);

    const analysisId = await requestAnalysis(document.id, USER_A);

    const reply = await waitForReply();
    expect(reply.body).toEqual({ analysisId, reason: DOCUMENT_NOT_READY_REASON });
  });

  it("rejects a document whose processing failed", async () => {
    const document = newDocument(USER_A, "broken.pdf");
    document.markAsFailed("could not extract text");
    await repository.save(document);

    const analysisId = await requestAnalysis(document.id, USER_A);

    const reply = await waitForReply();
    expect(reply.body).toEqual({ analysisId, reason: DOCUMENT_FAILED_REASON });
  });

  it("rejects a deleted document as not found", async () => {
    const document = newDocument(USER_A, "deleted.pdf");
    document.markAsProcessed();
    document.delete();
    await repository.save(document);

    const analysisId = await requestAnalysis(document.id, USER_A);

    const reply = await waitForReply();
    expect(reply.body).toEqual({ analysisId, reason: DOCUMENT_NOT_FOUND_REASON });
  });

  it("publishes document.deleted when a document is deleted", async () => {
    const document = newDocument(USER_A, "to-delete.pdf");
    await repository.save(document);

    await amqp.request({
      exchange: EXCHANGES.RPC,
      routingKey: RPC_ROUTING_KEYS.DOCUMENTS_DELETE,
      payload: { documentId: document.id, userId: USER_A },
      timeout: 10_000,
    });

    const reply = await waitForReply();
    expect(reply.routingKey).toBe(ROUTING_KEYS.DOCUMENT_DELETED);
    expect(reply.body).toEqual({ documentId: document.id, userId: USER_A });
  });
});
