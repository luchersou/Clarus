import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import type { Options } from "amqplib";
import { EXCHANGES } from "@clarus/event-contracts";
import { PrismaService } from "../persistence/prisma.service.js";

const BATCH_SIZE = 50;
const PUBLISH_TIMEOUT_MS = 5_000;

interface PendingOutboxEvent {
  id: string;
  routingKey: string;
  payload: unknown;
}

/**
 * Publishes the events stored in the outbox. An event is marked as published
 * only after the broker confirms it, so delivery is at-least-once: consumers
 * must tolerate duplicates.
 */
@Injectable()
export class OutboxRelay implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name);
  private timer?: NodeJS.Timeout;
  private inFlight?: Promise<unknown>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {}

  onApplicationBootstrap() {
    const intervalMs = Number(this.configService.get("OUTBOX_POLL_INTERVAL_MS", 1_000));
    this.timer = setInterval(() => this.tick(), intervalMs);
  }

  async onModuleDestroy() {
    clearInterval(this.timer);
    await this.inFlight;
  }

  private tick() {
    if (this.inFlight) return;

    this.inFlight = this.publishPending()
      .catch((error: unknown) => this.logger.error("Outbox relay run failed", error))
      .finally(() => {
        this.inFlight = undefined;
      });
  }

  /** Publishes one batch of pending events, oldest first. Returns how many were published. */
  async publishPending(): Promise<number> {
    return this.prisma.$transaction(
      async (tx) => {
        // SKIP LOCKED lets several instances run the relay without publishing the same row twice
        const events = await tx.$queryRaw<PendingOutboxEvent[]>`
          SELECT "id", "routingKey", "payload"
          FROM "analysis"."OutboxEvent"
          WHERE "publishedAt" IS NULL
          ORDER BY "createdAt"
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        `;

        let published = 0;
        for (const event of events) {
          try {
            await this.amqpConnection.publish(EXCHANGES.EVENTS, event.routingKey, event.payload, {
              persistent: true,
              timeout: PUBLISH_TIMEOUT_MS,
            } as Options.Publish);

            await tx.outboxEvent.update({
              where: { id: event.id },
              data: { publishedAt: new Date() },
            });
            published++;
          } catch (error) {
            await tx.outboxEvent.update({
              where: { id: event.id },
              data: {
                attempts: { increment: 1 },
                lastError: error instanceof Error ? error.message : String(error),
              },
            });
            this.logger.warn(`Failed to publish outbox event ${event.id}; will retry`);
            // stop here so later events are not published ahead of this one
            break;
          }
        }

        return published;
      },
      { timeout: 60_000 },
    );
  }
}
