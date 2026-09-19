import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ZodExceptionFilter } from "./filters/zod-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();