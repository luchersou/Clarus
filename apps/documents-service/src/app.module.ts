import { Module } from "@nestjs/common";
import { DocumentsModule } from "./documents.module.js";

@Module({
  imports: [DocumentsModule],
})
export class AppModule {}