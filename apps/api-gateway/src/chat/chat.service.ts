import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import type { Response } from "express";

interface ChatRequestBody {
  userId: string;
  question: string;
  sessionId?: string;
  documentId?: string;
}

@Injectable()
export class ChatService {
  private readonly ragServiceUrl = process.env.RAG_SERVICE_URL!;

  constructor(private readonly httpService: HttpService) {}

  async streamChatToResponse(body: ChatRequestBody, res: Response): Promise<void> {
    const response = await firstValueFrom(
      this.httpService.post(`${this.ragServiceUrl}/chat`, body, {
        responseType: "stream",
        headers: { Accept: "text/event-stream" },
      }),
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.data.pipe(res);
  }

  async listSessions(userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.ragServiceUrl}/chat/sessions`, {
        params: { user_id: userId },
      }),
    );
    return response.data;
  }

  async getSessionMessages(sessionId: string, userId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.ragServiceUrl}/chat/sessions/${sessionId}/messages`, {
        params: { user_id: userId },
      }),
    );
    return response.data;
  }
}