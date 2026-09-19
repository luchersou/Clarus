import { Module } from "@nestjs/common";
import { SharedModule } from "../shared/shared.module.js";
import { DashboardController } from "./dashboard.controller.js";
import { DashboardService } from "./dashboard.service.js";

@Module({
  imports: [SharedModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}