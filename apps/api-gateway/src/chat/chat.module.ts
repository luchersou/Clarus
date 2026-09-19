import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";

@Module({
  imports: [HttpModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}