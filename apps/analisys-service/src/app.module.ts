import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalysesModule } from "./analyses.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AnalysesModule,
  ],
})
export class AppModule {}