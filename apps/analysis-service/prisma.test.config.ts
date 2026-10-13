import { defineConfig } from "prisma/config";

// Used only by the integration tests. It deliberately does not import dotenv,
// so it can never pick up the DATABASE_URL from the service's .env file.
const url = process.env["DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL must be provided by the test global setup");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url },
});