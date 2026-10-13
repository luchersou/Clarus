import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { RabbitMQContainer } from "@testcontainers/rabbitmq";
import type { TestProject } from "vitest/node";

const serviceRoot = fileURLToPath(new URL("../..", import.meta.url));
const repoRoot = path.resolve(serviceRoot, "../..");

export default async function setup(project: TestProject) {
  const postgres = await new PostgreSqlContainer("ankane/pgvector:latest")
    .withDatabase("clarus")
    .withCopyFilesToContainer([
      {
        source: path.join(repoRoot, "init-schemas.sql"),
        target: "/docker-entrypoint-initdb.d/init-schemas.sql",
      },
    ])
    .start();

  const rabbitmq = await new RabbitMQContainer("rabbitmq:4-management").start();

  const databaseUrl = postgres.getConnectionUri();

  execSync("pnpm exec prisma migrate deploy --config prisma.test.config.ts", {
    cwd: serviceRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  project.provide("databaseUrl", databaseUrl);
  project.provide("rabbitmqUrl", rabbitmq.getAmqpUrl());

  return async () => {
    await rabbitmq.stop();
    await postgres.stop();
  };
}

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
    rabbitmqUrl: string;
  }
}