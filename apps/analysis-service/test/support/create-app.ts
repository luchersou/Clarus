import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { inject } from "vitest";

/** Boots the real AppModule against the containers started by the global setup. */
export async function createApp(env: Record<string, string> = {}): Promise<INestApplication> {
  const databaseUrl = inject("databaseUrl");
  const host = new URL(databaseUrl).hostname;
  if (!["localhost", "127.0.0.1"].includes(host)) {
    throw new Error(`Refusing to run: test database host is "${host}", expected a local container`);
  }

  process.env.DATABASE_URL = databaseUrl;
  process.env.RABBITMQ_URL = inject("rabbitmqUrl");
  // keep the background jobs out of the way unless a test opts in
  process.env.OUTBOX_POLL_INTERVAL_MS = "3600000";
  process.env.ANALYSIS_TIMEOUT_CHECK_INTERVAL_MS = "3600000";
  Object.assign(process.env, env);

  // Imported here: RabbitMQModule.forRoot reads RABBITMQ_URL at load time.
  const { AppModule } = await import("../../src/app.module.js");

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
