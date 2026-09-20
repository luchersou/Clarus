import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";

import { AppModule } from "./app.module.js";
import { ZodExceptionFilter } from "./presentation/filters/zod-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ZodExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3002);

  await app.listen(port);
}

bootstrap();