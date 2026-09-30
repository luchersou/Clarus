import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module.js";
import { DocumentsModule } from "./documents/documents.module.js";
import { AnalysesModule } from "./analyses/analyses.module.js";
import { ChatModule } from "./chat/chat.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";
import { HealthController } from "./health/health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    DocumentsModule,
    AnalysesModule,
    ChatModule,
    DashboardModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}