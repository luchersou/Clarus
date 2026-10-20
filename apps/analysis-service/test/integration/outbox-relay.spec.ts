import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { EXCHANGES, ROUTING_KEYS } from "@clarus/event-contracts";
import { connect } from "amqplib";
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { RequestAnalysisUseCase } from "../../src/application/request-analysis.use-case.js";
import { OutboxRelay } from "../../src/infrastructure/messaging/outbox-relay.js";
import { PrismaService } from "../../src/infrastructure/persistence/prisma.service.js";
import { createApp } from "../support/create-app.js";
import { waitFor } from "../support/wait-for.js";

type Connection = Awaited<ReturnType<typeof connect>>;
type Channel = Awaited<ReturnType<Connection["createChannel"]>>;

const USER_A = "11111111-1111-4111-8111-111111111111";
const REQUESTED_PROBE = "test.analysis-requested-probe";

describe("outbox relay (Real Postgres + RabbitMQ)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let relay: OutboxRelay;
  let requestAnalysis: RequestAnalysisUseCase;
  let probeConnection: Connection;
  let probe: Channel;

  async function takeRequested() {
    const message = await probe.get(REQUESTED_PROBE, { noAck: true });
    return message ? JSON.parse(message.content.toString()) : null;
  }

  beforeAll(async () => {
    app = await createApp();

    prisma = app.get(PrismaService);
    relay = app.get(OutboxRelay);
    requestAnalysis = app.get(RequestAnalysisUseCase);

    // Stands in for rag-service: shows what reaches the broker as analysis.requested.
    probeConnection = await connect(inject("rabbitmqUrl"));
    probe = await probeConnection.createChannel();
    await probe.assertQueue(REQUESTED_PROBE, { durable: true });
    await probe.bindQueue(REQUESTED_PROBE, EXCHANGES.EVENTS, ROUTING_KEYS.ANALYSIS_REQUESTED);
  });

  afterAll(async () => {
    await probe.close();
    await probeConnection.close();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.outboxEvent.deleteMany();
    await prisma.analysis.deleteMany();
    await probe.purgeQueue(REQUESTED_PROBE);
  });

  it("requesting an analysis stores the event in the outbox instead of publishing it", async () => {
    const analysis = await requestAnalysis.execute({
      documentId: randomUUID(),
      userId: USER_A,
      type: "SUMMARY",
    });

    const outbox = await prisma.outboxEvent.findMany();
    expect(outbox).toHaveLength(1);
    expect(outbox[0]).toMatchObject({
      routingKey: ROUTING_KEYS.ANALYSIS_REQUESTED,
      publishedAt: null,
      payload: {
        analysisId: analysis.id,
        documentId: analysis.documentId,
        userId: USER_A,
        type: "SUMMARY",
      },
    });
    expect(await takeRequested()).toBeNull();
  });

  it("publishes pending events and marks them as published", async () => {
    const analysis = await requestAnalysis.execute({
      documentId: randomUUID(),
      userId: USER_A,
      type: "DEADLINES",
    });

    expect(await relay.publishPending()).toBe(1);

    const message = await waitFor(takeRequested, { message: "analysis.requested on the broker" });
    expect(message).toMatchObject({ analysisId: analysis.id, type: "DEADLINES" });

    const [row] = await prisma.outboxEvent.findMany();
    expect(row.publishedAt).not.toBeNull();
  });

  it("does not publish an event twice", async () => {
    await requestAnalysis.execute({ documentId: randomUUID(), userId: USER_A, type: "SUMMARY" });

    expect(await relay.publishPending()).toBe(1);
    expect(await relay.publishPending()).toBe(0);

    await waitFor(takeRequested, { message: "analysis.requested on the broker" });
    expect(await takeRequested()).toBeNull();
  });

  it("publishes events in the order they were created", async () => {
    const first = await requestAnalysis.execute({
      documentId: randomUUID(),
      userId: USER_A,
      type: "SUMMARY",
    });
    const second = await requestAnalysis.execute({
      documentId: randomUUID(),
      userId: USER_A,
      type: "COMPARE",
    });

    expect(await relay.publishPending()).toBe(2);

    const a = await waitFor(takeRequested, { message: "first event" });
    const b = await waitFor(takeRequested, { message: "second event" });
    expect([a.analysisId, b.analysisId]).toEqual([first.id, second.id]);
  });

  it("does not store the analysis or the event when the event payload is invalid", async () => {
    await expect(
      requestAnalysis.execute({
        documentId: "not-a-uuid",
        userId: USER_A,
        type: "SUMMARY",
      }),
    ).rejects.toThrow();

    expect(await prisma.analysis.count()).toBe(0);
    expect(await prisma.outboxEvent.count()).toBe(0);
  });
});
