import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import type { Readable } from "node:stream";
import type { Response } from "express";

interface ChatRequestBody {
  userId: string;
  question: string;
  sessionId?: string;
  documentId?: string;
}

// Covers the wait for the rag-service to answer (embedding, retrieval, first token).
// Node applies it as socket inactivity, so an answer that keeps streaming isn't cut off.
const STREAM_TIMEOUT_MS = 60_000;
const REQUEST_TIMEOUT_MS = 15_000;

const SESSION_NOT_FOUND = "Chat session not found";

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly ragServiceUrl = process.env.RAG_SERVICE_URL!;

  constructor(private readonly httpService: HttpService) {}

  async streamChatToResponse(body: ChatRequestBody, res: Response): Promise<void> {
    // Stops the upstream generation, and the LLM tokens it spends, when the client goes away
    const upstream = new AbortController();
    res.on("close", () => upstream.abort());

    let stream: Readable;
    try {
      const response = await firstValueFrom(
        this.httpService.post<Readable>(
          `${this.ragServiceUrl}/chat`,
          {
            user_id: body.userId,
            question: body.question,
            session_id: body.sessionId,
            document_id: body.documentId,
          },
          {
            responseType: "stream",
            headers: { Accept: "text/event-stream" },
            timeout: STREAM_TIMEOUT_MS,
            signal: upstream.signal,
          },
        ),
      );
      stream = response.data;
    } catch (error) {
      this.mapRagError(error);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    stream.on("error", (error) => {
      if (!upstream.signal.aborted) {
        this.logger.error(`Chat stream from rag-service failed: ${error.message}`);
      }
      // The headers are already sent, so all the client can see is the stream ending
      res.end();
    });

    stream.pipe(res);
  }

  async listSessions(userId: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.ragServiceUrl}/chat/sessions`, {
          params: { user_id: userId },
          timeout: REQUEST_TIMEOUT_MS,
        }),
      );
      return response.data;
    } catch (error) {
      this.mapRagError(error);
    }
  }

  async getSessionMessages(sessionId: string, userId: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.ragServiceUrl}/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
          {
            params: { user_id: userId },
            timeout: REQUEST_TIMEOUT_MS,
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.mapRagError(error);
    }
  }

  // The rag-service answers 404 for a missing session (or another user's) and 422
  // for a malformed id; both are the client's to fix. Anything else (down, timeout,
  // 5xx) is a 503.
  private mapRagError(error: unknown): never {
    const status = (error as { response?: { status?: number } } | null)?.response?.status;

    if (status === 404) throw new NotFoundException(SESSION_NOT_FOUND);
    if (status === 422) throw new BadRequestException("Invalid chat request");

    // Not logging response.data: on a streamed request it is the socket stream itself
    this.logger.error(
      `rag-service call failed${status ? ` with status ${status}` : ""}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw new ServiceUnavailableException(
      "The service is temporarily unavailable. Please try again later.",
    );
  }
}
