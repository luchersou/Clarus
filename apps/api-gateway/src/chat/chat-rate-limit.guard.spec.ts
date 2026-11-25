import { HttpException, type ExecutionContext } from "@nestjs/common";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatRateLimitGuard } from "./chat-rate-limit.guard.js";

function contextFor(userId: string) {
  const setHeader = vi.fn();
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId } }),
      getResponse: () => ({ setHeader }),
    }),
  } as unknown as ExecutionContext;
  return { context, setHeader };
}

function statusOf(run: () => unknown): number | undefined {
  try {
    run();
  } catch (error) {
    if (error instanceof HttpException) return error.getStatus();
    throw error;
  }
  return undefined;
}

describe("ChatRateLimitGuard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows 10 messages a minute and answers 429 with Retry-After on the 11th", () => {
    const guard = new ChatRateLimitGuard();
    const { context, setHeader } = contextFor("user-a");

    for (let i = 0; i < 10; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(statusOf(() => guard.canActivate(context))).toBe(429);
    expect(setHeader).toHaveBeenCalledWith("Retry-After", 60);
  });

  it("counts each user separately", () => {
    const guard = new ChatRateLimitGuard();
    const a = contextFor("user-a").context;
    const b = contextFor("user-b").context;

    for (let i = 0; i < 10; i++) guard.canActivate(a);

    expect(statusOf(() => guard.canActivate(a))).toBe(429);
    expect(guard.canActivate(b)).toBe(true);
  });

  it("lets the user send again once the minute has passed", () => {
    const guard = new ChatRateLimitGuard();
    const { context } = contextFor("user-a");

    for (let i = 0; i < 10; i++) guard.canActivate(context);
    vi.advanceTimersByTime(60 * 1000);

    expect(guard.canActivate(context)).toBe(true);
  });

  it("stops the user at 200 messages a day", () => {
    const guard = new ChatRateLimitGuard();
    const { context } = contextFor("user-a");

    // 10 per minute stays under the per-minute limit
    for (let minute = 0; minute < 20; minute++) {
      for (let i = 0; i < 10; i++) {
        expect(guard.canActivate(context)).toBe(true);
      }
      vi.advanceTimersByTime(60 * 1000);
    }

    expect(statusOf(() => guard.canActivate(context))).toBe(429);

    vi.advanceTimersByTime(24 * 60 * 60 * 1000);
    expect(guard.canActivate(context)).toBe(true);
  });
});
