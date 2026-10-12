import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EXCHANGES, ROUTING_KEYS } from "@clarus/event-contracts";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it, vi } from "vitest";
import { FILE_STORAGE, type FileStoragePort } from "../../src/application/ports/file-storage.port.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { ZodExceptionFilter } from "../../src/presentation/filters/zod-exception.filter.js";
import { waitFor } from "../support/wait-for.js"; 

const USER_A = "11111111-1111-4111-8111-111111111111";
const pdf = Buffer.from("%PDF-1.4 fake content");

const fakeStorage = {
  upload: vi.fn(async ({ path }: { path: string }) => ({ path })),
  getSignedUrl: vi.fn(async (path: string) => `https://signed.test/${path}`),
  getSignedUrls: vi.fn(async (paths: string[]) =>
    Object.fromEntries(paths.map((path) => [path, `https://signed.test/${path}`])),
  ),
  delete: vi.fn(async () => {}),
} satisfies FileStoragePort;

type UploadedEvent = { documentId: string; userId: string; storageUrl: string; fileType: string };

describe("POST /documents (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const published: UploadedEvent[] = [];

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

    const { AppModule } = await import("../../src/app.module.js");

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(FILE_STORAGE)
      .useValue(fakeStorage)
      .compile();

    app = moduleRef.createNestApplication();
    // main.ts isn't executed in tests, so the global filter has to be applied here
    app.useGlobalFilters(new ZodExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    // Temporary queue bound to the events exchange, to observe document.uploaded
    const channel = app.get(AmqpConnection).channel;
    const { queue } = await channel.assertQueue("", { exclusive: true, autoDelete: true });
    await channel.bindQueue(queue, EXCHANGES.EVENTS, ROUTING_KEYS.DOCUMENT_UPLOADED);
    await channel.consume(queue, (message) => {
      if (!message) return;
      published.push(JSON.parse(message.content.toString()));
      channel.ack(message);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
    published.length = 0;
    vi.clearAllMocks();
  });

  it("stores the file, saves the document and publishes document.uploaded", async () => {
    const res = await request(app.getHttpServer())
      .post("/documents")
      .field("userId", USER_A)
      .field("fileName", "contract.pdf")
      .field("fileType", "PDF")
      .attach("file", pdf, { filename: "contract.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      fileName: "contract.pdf",
      fileType: "PDF",
      status: "UPLOADED",
    });
    expect(res.body.url).toMatch(/^https:\/\/signed\.test\//);

    expect(fakeStorage.upload).toHaveBeenCalledTimes(1);
    const uploadArgs = fakeStorage.upload.mock.calls[0]![0] as unknown as {
      path: string;
      contentType: string;
    };
    expect(uploadArgs.path.startsWith(`${USER_A}/`)).toBe(true);
    expect(uploadArgs.contentType).toBe("application/pdf");

    const rows = await prisma.document.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: res.body.id,
      userId: USER_A,
      status: "UPLOADED",
      fileSizeBytes: pdf.length,
    });
    expect(rows[0]!.storageUrl).toBe(uploadArgs.path);

    const event = await waitFor(async () => published.find((e) => e.documentId === res.body.id), {
      message: "document.uploaded event",
    });
    expect(event).toMatchObject({ userId: USER_A, fileType: "PDF", storageUrl: uploadArgs.path });
  });

  it("answers 400 when the file is missing", async () => {
    const res = await request(app.getHttpServer())
      .post("/documents")
      .field("userId", USER_A)
      .field("fileName", "contract.pdf")
      .field("fileType", "PDF");

    expect(res.status).toBe(400);
    expect(fakeStorage.upload).not.toHaveBeenCalled();
    expect(await prisma.document.count()).toBe(0);
  });

  it.each([
    ["userId is not a uuid", { userId: "not-a-uuid", fileName: "a.pdf", fileType: "PDF" }, "userId"],
    ["fileName is empty", { userId: USER_A, fileName: "", fileType: "PDF" }, "fileName"],
    ["fileType is unsupported", { userId: USER_A, fileName: "a.txt", fileType: "TXT" }, "fileType"],
  ])("answers 400 when %s, and saves nothing", async (_label, fields, invalidField) => {
    const req = request(app.getHttpServer()).post("/documents");
    for (const [key, value] of Object.entries(fields)) req.field(key, value);
    const res = await req.attach("file", pdf, {
      filename: "a.pdf",
      contentType: "application/pdf",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty(invalidField);
    expect(fakeStorage.upload).not.toHaveBeenCalled();
    expect(await prisma.document.count()).toBe(0);
  });
});