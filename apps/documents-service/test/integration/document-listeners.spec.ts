import { randomUUID } from "node:crypto";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EXCHANGES, ROUTING_KEYS } from "@clarus/event-contracts";
import { connect } from "amqplib";
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { FILE_STORAGE } from "../../src/application/ports/file-storage.port.js";
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
const DLQ_PROBE = "test.dlq-probe";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const newDocument = (userId: string, fileName: string) =>
  Document.create({
    userId,
    fileName,
    fileType: "PDF",
    fileSizeBytes: 1024,
    storageUrl: `${userId}/${fileName}`,
  });

describe("document listeners (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let amqp: AmqpConnection;
  let prisma: PrismaService;
  let repository: DocumentRepository;
  let probeConnection: Connection;
  let probe: Channel;

  const publish = (routingKey: string, payload: unknown) =>
    amqp.publish(EXCHANGES.EVENTS, routingKey, payload);

  const waitForStatus = (id: string, status: string) =>
    waitFor(
      async () => {
        const found = await repository.findById(id);
        return found?.status === status ? found : null;
      },
      { message: `document to become ${status}` },
    );

  async function takeDeadLetter() {
    const message = await probe.get(DLQ_PROBE, { noAck: true });
    return message
      ? { routingKey: message.fields.routingKey, body: message.content.toString() }
      : null;
  }

  const waitForDeadLetter = () =>
    waitFor(takeDeadLetter, { message: "a dead-lettered message" });

  // A message is known to be fully handled only after a later one on the same
  // queue was handled too, so "nothing happened" assertions use a sentinel.
  async function settleEmbeddedQueue() {
    const sentinel = newDocument(USER_B, "sentinel.pdf");
    await repository.save(sentinel);
    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDED, { documentId: sentinel.id, chunksCount: 1 });
    await waitForStatus(sentinel.id, "PROCESSED");
    await sleep(300);
  }

  async function settleFailedQueue() {
    const sentinel = newDocument(USER_B, "sentinel.pdf");
    await repository.save(sentinel);
    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED, {
      documentId: sentinel.id,
      reason: "sentinel",
    });
    await waitForStatus(sentinel.id, "FAILED");
    await sleep(300);
  }

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
      .useValue({}) // listeners never touch storage
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    amqp = app.get(AmqpConnection);
    prisma = app.get(PrismaService);
    repository = app.get<DocumentRepository>(DOCUMENT_REPOSITORY);

    // Probe queue bound to the dead-letter exchange: shows what gets dead-lettered.
    probeConnection = await connect(inject("rabbitmqUrl"));
    probe = await probeConnection.createChannel();
    await probe.assertQueue(DLQ_PROBE, { durable: true });
    await probe.bindQueue(DLQ_PROBE, EXCHANGES.DLX, "#");
  });

  afterAll(async () => {
    await probe.close();
    await probeConnection.close();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
    await probe.purgeQueue(DLQ_PROBE);
  });

  it("document.embedded marks the document as PROCESSED", async () => {
    const document = newDocument(USER_A, "cv.pdf");
    await repository.save(document);

    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDED, { documentId: document.id, chunksCount: 3 });

    const found = await waitForStatus(document.id, "PROCESSED");
    expect(found.failureReason).toBeNull();
  });

  it("document.embedding_failed marks the document as FAILED and stores the reason", async () => {
    const document = newDocument(USER_A, "scan.pdf");
    await repository.save(document);

    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED, {
      documentId: document.id,
      reason: "could not extract text",
    });

    const found = await waitForStatus(document.id, "FAILED");
    expect(found.failureReason).toBe("could not extract text");
  });

  it("ignores an event for a document that does not exist", async () => {
    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDED, { documentId: randomUUID(), chunksCount: 1 });

    await settleEmbeddedQueue();

    expect(await takeDeadLetter()).toBeNull();
  });

  it("ignores an event for a soft-deleted document", async () => {
    const document = newDocument(USER_A, "deleted.pdf");
    document.delete();
    await repository.save(document);

    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDED, { documentId: document.id, chunksCount: 1 });

    await settleEmbeddedQueue();

    const row = await prisma.document.findUnique({ where: { id: document.id } });
    expect(row?.status).toBe("UPLOADED");
    expect(await takeDeadLetter()).toBeNull();
  });

  it("dead-letters a malformed document.embedded payload", async () => {
    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDED, { documentId: "not-a-uuid" });

    const deadLetter = await waitForDeadLetter();

    expect(deadLetter.routingKey).toBe(ROUTING_KEYS.DOCUMENT_EMBEDDED);
  });

  it("does not touch any document when embedding_failed has no documentId", async () => {
    const bystander = newDocument(USER_A, "bystander.pdf");
    await repository.save(bystander);

    await publish(ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED, { reason: "orphan failure" });

    await settleFailedQueue();

    const row = await prisma.document.findUnique({ where: { id: bystander.id } });
    expect(row?.status).toBe("UPLOADED");
    const deadLetter = await waitForDeadLetter();
    expect(deadLetter.routingKey).toBe(ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED);
  });
});