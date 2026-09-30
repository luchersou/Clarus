import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DocumentsModule } from "./documents.module.js";
import { HealthController } from "./presentation/health/health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocumentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}