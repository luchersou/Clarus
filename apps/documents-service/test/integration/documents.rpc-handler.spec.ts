import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EXCHANGES, RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { FILE_STORAGE, type FileStoragePort } from "../../src/application/ports/file-storage.port.js";
import { Document } from "../../src/domain/document.entity.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "../../src/domain/document.repository.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

// Mirror every method of FileStoragePort here (open file-storage.port.ts).
// If one is missing, the test fails at runtime with "x is not a function".
const fakeStorage: FileStoragePort = {
  upload: async ({ path }) => ({ path }),
  getSignedUrl: async (path) => `https://signed.test/${path}`,
  getSignedUrls: async (paths) =>
    Object.fromEntries(paths.map((path) => [path, `https://signed.test/${path}`])),
  delete: async () => {},
};

type DocumentDto = { id: string; fileName: string; status: string };

const newDocument = (userId: string, fileName: string) =>
  Document.create({
    userId,
    fileName,
    fileType: "PDF",
    fileSizeBytes: 1024,
    storageUrl: `${userId}/${fileName}`,
  });

describe("documents RPC handlers (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let amqp: AmqpConnection;
  let prisma: PrismaService;
  let repository: DocumentRepository;

  // Returns the reply as data, and also as text, so failure assertions
  // work whether the error comes back as a rejection or as a reply payload.
  async function call(routingKey: string, payload: unknown) {
    try {
      const data = await amqp.request<unknown>({
        exchange: EXCHANGES.RPC,
        routingKey,
        payload,
        timeout: 10_000,
      });
      return { data, text: JSON.stringify(data) };
    } catch (error) {
      return {
        data: undefined,
        text: error instanceof Error ? error.message : JSON.stringify(error),
      };
    }
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

    // Imported here, not at the top of the file: RabbitMQModule.forRoot reads
    // RABBITMQ_URL when its file is loaded, so the env must be set first.
    const { AppModule } = await import("../../src/app.module.js");

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FILE_STORAGE)
      .useValue(fakeStorage)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    amqp = app.get(AmqpConnection);
    prisma = app.get(PrismaService);
    repository = app.get<DocumentRepository>(DOCUMENT_REPOSITORY);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
  });

  it("documents.list returns only the caller's documents", async () => {
    await repository.save(newDocument(USER_A, "a-1.pdf"));
    await repository.save(newDocument(USER_A, "a-2.pdf"));
    await repository.save(newDocument(USER_B, "b-1.pdf"));

    const { data } = await call(RPC_ROUTING_KEYS.DOCUMENTS_LIST, { userId: USER_A });

    const names = (data as DocumentDto[]).map((d) => d.fileName).sort();
    expect(names).toEqual(["a-1.pdf", "a-2.pdf"]);
  });

  it("documents.get-by-id returns the document to its owner", async () => {
    const document = newDocument(USER_A, "contract.pdf");
    await repository.save(document);

    const { data } = await call(RPC_ROUTING_KEYS.DOCUMENTS_GET_BY_ID, {
      documentId: document.id,
      userId: USER_A,
    });

    expect(data).toMatchObject({
      id: document.id,
      fileName: "contract.pdf",
      status: "UPLOADED",
    });
  });

  it("documents.get-by-id answers NOT_FOUND for another user's document, without leaking it", async () => {
    const document = newDocument(USER_A, "secret.pdf");
    await repository.save(document);

    const { data, text } = await call(RPC_ROUTING_KEYS.DOCUMENTS_GET_BY_ID, {
      documentId: document.id,
      userId: USER_B,
    });

    expect(data).toMatchObject({ error: "NOT_FOUND" });
    expect(text).not.toContain("secret.pdf");
  });

  it("documents.delete does not delete another user's document", async () => {
    const document = newDocument(USER_A, "mine.pdf");
    await repository.save(document);

    const { data } = await call(RPC_ROUTING_KEYS.DOCUMENTS_DELETE, {
      documentId: document.id,
      userId: USER_B,
    });

    expect(data).toMatchObject({ error: "NOT_FOUND" });
    const row = await prisma.document.findUnique({ where: { id: document.id } });
    expect(row?.deletedAt).toBeNull();
  });

  it("documents.delete on an already-deleted document answers NOT_FOUND", async () => {
    const document = newDocument(USER_A, "twice.pdf");
    await repository.save(document);
    const payload = { documentId: document.id, userId: USER_A };

    await call(RPC_ROUTING_KEYS.DOCUMENTS_DELETE, payload);
    const { data } = await call(RPC_ROUTING_KEYS.DOCUMENTS_DELETE, payload);

    expect(data).toMatchObject({ error: "NOT_FOUND" });
  });

  it("rejects a malformed payload with VALIDATION_ERROR", async () => {
    const { data, text } = await call(RPC_ROUTING_KEYS.DOCUMENTS_LIST, {});

    expect(data).toMatchObject({ error: "VALIDATION_ERROR" });
    expect(text).toContain("userId");
  });
});