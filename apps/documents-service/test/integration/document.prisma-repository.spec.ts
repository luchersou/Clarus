import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { Document } from "../../src/domain/document.entity.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { DocumentPrismaRepository } from "../../src/infrastructure/persistence/document.prisma-repository.js";

const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

const newDocument = (userId = USER_A, fileName = "contract.pdf") =>
  Document.create({
    userId,
    fileName,
    fileType: "PDF",
    fileSizeBytes: 2048,
    storageUrl: `${userId}/${fileName}`,
  });

describe("DocumentPrismaRepository (Postgres real)", () => {
  let prisma: PrismaService;
  let repository: DocumentPrismaRepository;

  beforeAll(async () => {
    const url = inject("databaseUrl");
    const host = new URL(url).hostname;
    if (!["localhost", "127.0.0.1"].includes(host)) {
      throw new Error(`Refusing to run: test database host is "${host}", expected a local container`);
    }

    process.env.DATABASE_URL = url;
    prisma = new PrismaService();
    await prisma.onModuleInit();
    repository = new DocumentPrismaRepository(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
  });

  it("persists and reloads every field", async () => {
    const document = newDocument();
    await repository.save(document);

    const found = await repository.findById(document.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(document.id);
    expect(found!.userId).toBe(USER_A);
    expect(found!.fileName).toBe("contract.pdf");
    expect(found!.fileType).toBe("PDF");
    expect(found!.fileSizeBytes).toBe(2048);
    expect(found!.storageUrl).toBe(document.storageUrl);
    expect(found!.status).toBe("UPLOADED");
    expect(found!.failureReason).toBeNull();
    expect(found!.deletedAt).toBeNull();
    expect(found!.createdAt).toEqual(document.createdAt);
  });

  it("updates on a second save instead of duplicating", async () => {
    const document = newDocument();
    await repository.save(document);

    document.markAsProcessed();
    await repository.save(document);

    expect(await prisma.document.count()).toBe(1);
    expect((await repository.findById(document.id))!.status).toBe("PROCESSED");
  });

  it("persists the failure reason", async () => {
    const document = newDocument();
    document.markAsFailed("could not extract text");
    await repository.save(document);

    const found = await repository.findById(document.id);

    expect(found!.status).toBe("FAILED");
    expect(found!.failureReason).toBe("could not extract text");
  });

  it("hides soft-deleted documents but keeps the row", async () => {
    const document = newDocument();
    await repository.save(document);

    document.delete();
    await repository.save(document);

    expect(await repository.findById(document.id)).toBeNull();
    expect(await repository.findByUserId(USER_A)).toHaveLength(0);

    const row = await prisma.document.findUnique({ where: { id: document.id } });
    expect(row).not.toBeNull();
    expect(row!.deletedAt).not.toBeNull();
  });

  it("lists only the user's documents, newest first", async () => {
    const first = newDocument(USER_A, "first.pdf");
    await repository.save(first);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = newDocument(USER_A, "second.pdf");
    await repository.save(second);
    await repository.save(newDocument(USER_B, "other.pdf"));

    const documents = await repository.findByUserId(USER_A);

    expect(documents.map((d) => d.fileName)).toEqual(["second.pdf", "first.pdf"]);
  });
});