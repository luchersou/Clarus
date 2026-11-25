import { createServer, request, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { HttpService } from "@nestjs/axios";
import { NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";
import type { Response } from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChatService } from "./chat.service.js";

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

function listen(handler: Handler): Promise<{ server: Server; url: string }> {
  const server = createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function close(server: Server): Promise<void> {
  server.closeAllConnections();
  return new Promise((resolve) => server.close(() => resolve()));
}

const body = { userId: "11111111-1111-1111-1111-111111111111", question: "hi" };

describe("ChatService", () => {
  const servers: Server[] = [];
  let service: ChatService;

  async function fakeRag(handler: Handler): Promise<void> {
    const { server, url } = await listen(handler);
    servers.push(server);
    process.env.RAG_SERVICE_URL = url;
    service = new ChatService(new HttpService(axios.create()));
  }

  beforeEach(() => {
    servers.length = 0;
  });

  afterEach(async () => {
    await Promise.all(servers.map(close));
  });

  it("maps a 404 from the rag-service to NotFoundException on the streamed chat", async () => {
    await fakeRag((_req, res) => {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: "Chat session not found" }));
    });

    // Express is not involved before the upstream answers; a bare listener is enough
    const res = { on: () => undefined } as unknown as Response;
    await expect(service.streamChatToResponse(body, res)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("maps an unreachable rag-service to ServiceUnavailableException", async () => {
    process.env.RAG_SERVICE_URL = "http://127.0.0.1:1";
    service = new ChatService(new HttpService(axios.create()));

    await expect(service.listSessions(body.userId)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it("maps a 404 on a session's messages to NotFoundException", async () => {
    await fakeRag((_req, res) => {
      res.writeHead(404).end();
    });

    await expect(
      service.getSessionMessages("22222222-2222-2222-2222-222222222222", body.userId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("pipes the event stream through, and aborts it upstream when the client disconnects", async () => {
    let upstreamClosed!: () => void;
    const upstreamClosedPromise = new Promise<void>((resolve) => (upstreamClosed = resolve));

    await fakeRag((req, res) => {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.write("event: message\ndata: hello\n\n");
      // Never ends on its own, like a long LLM answer
      req.socket.on("close", () => upstreamClosed());
    });

    const gateway = await listen((_req, res) => {
      void service.streamChatToResponse(body, res as unknown as Response);
    });
    servers.push(gateway.server);

    const firstChunk = await new Promise<string>((resolve, reject) => {
      const clientReq = request(gateway.url, (clientRes) => {
        expect(clientRes.headers["content-type"]).toBe("text/event-stream");
        clientRes.once("data", (chunk: Buffer) => {
          resolve(chunk.toString());
          clientReq.destroy();
        });
      });
      clientReq.on("error", reject);
      clientReq.end();
    });

    expect(firstChunk).toContain("data: hello");
    await upstreamClosedPromise;
  });
});
