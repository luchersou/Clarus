import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DocumentsModule } from "./documents.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DocumentsModule,
  ],
})
export class AppModule {}