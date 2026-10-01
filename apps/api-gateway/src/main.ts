import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module.js";
import { ZodExceptionFilter } from "./filters/zod-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.FRONTEND_URLS ?? "").split(",").map((url) => url.trim());

  app.useGlobalFilters(new ZodExceptionFilter());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3001);

  await app.listen(port);
}

bootstrap();