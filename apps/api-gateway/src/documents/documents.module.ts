import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { SharedModule } from "../shared/shared.module.js";
import { DocumentsController } from "./documents.controller.js";
import { DocumentsService } from "./documents.service.js";

@Module({
  imports: [HttpModule, SharedModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}