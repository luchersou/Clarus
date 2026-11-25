import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/supabase-auth.guard.js";

interface RateWindow {
  limit: number;
  durationMs: number;
  message: string;
}

// Every chat message costs an embedding call and an LLM completion.
const WINDOWS: RateWindow[] = [
  {
    limit: 10,
    durationMs: 60 * 1000,
    message: "Too many messages. Wait a minute and try again.",
  },
  {
    limit: 200,
    durationMs: 24 * 60 * 60 * 1000,
    message: "You've reached today's chat limit. Try again tomorrow.",
  },
];

const LONGEST_WINDOW_MS = Math.max(...WINDOWS.map((window) => window.durationMs));
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Per-user sliding-window limit on chat messages, kept in this process's memory.
 * It assumes a single gateway instance; with several, each would count separately.
 * Runs after the global auth guard, so request.user is set.
 */
@Injectable()
export class ChatRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = Date.now();

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const userId = http.getRequest<AuthenticatedRequest>().user.id;
    const now = Date.now();

    this.sweep(now);

    const timestamps = (this.hits.get(userId) ?? []).filter(
      (time) => now - time < LONGEST_WINDOW_MS,
    );
    this.hits.set(userId, timestamps);

    for (const window of WINDOWS) {
      const inWindow = timestamps.filter((time) => now - time < window.durationMs);
      if (inWindow.length >= window.limit) {
        const retryAfterMs = inWindow[0] + window.durationMs - now;
        http.getResponse<Response>().setHeader("Retry-After", Math.ceil(retryAfterMs / 1000));
        throw new HttpException(window.message, HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    timestamps.push(now);
    return true;
  }

  // Drops users with no hit inside the longest window, so the map doesn't grow forever.
  private sweep(now: number): void {
    if (now - this.lastSweep < SWEEP_INTERVAL_MS) return;
    this.lastSweep = now;

    for (const [userId, timestamps] of this.hits) {
      if (timestamps.every((time) => now - time >= LONGEST_WINDOW_MS)) {
        this.hits.delete(userId);
      }
    }
  }
}
