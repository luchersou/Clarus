import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalysesModule } from "./analyses.module.js";
import { HealthController } from "./presentation/health/health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AnalysesModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}