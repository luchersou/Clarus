import { Controller, Post, Get, Param, Body, Res } from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/supabase-auth.guard.js";
import { ChatService } from "./chat.service.js";
import { ChatBodySchema } from "./dto/chat.dto.js";


@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const dto = ChatBodySchema.parse(body);

    await this.chatService.streamChatToResponse(
      {
        userId: user.id,
        question: dto.question,
        sessionId: dto.sessionId,
        documentId: dto.documentId,
      },
      res,
    );
  }

  @Get("sessions")
  async listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.listSessions(user.id);
  }

  @Get("sessions/:id/messages")
  async getSessionMessages(
    @Param("id") sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.chatService.getSessionMessages(sessionId, user.id);
  }
}