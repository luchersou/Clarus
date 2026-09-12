import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ZodExceptionFilter } from "./presentation/filters/zod-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();