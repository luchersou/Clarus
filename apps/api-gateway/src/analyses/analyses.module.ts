import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module.js";
import { AnalysesController } from "./analyses.controller.js";
import { AnalysesService } from "./analyses.service.js";

@Module({
  imports: [SharedModule],
  controllers: [AnalysesController],
  providers: [AnalysesService],
})
export class AnalysesModule {}