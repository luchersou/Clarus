import { Injectable } from "@nestjs/common";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES } from "@clarus/event-contracts";

export interface RpcErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

@Injectable()
export class RpcClientService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async request<TResponse = unknown>(
    routingKey: string,
    payload: Record<string, unknown>,
    timeout = 5000,
  ): Promise<TResponse | RpcErrorResponse> {
    return this.amqpConnection.request<TResponse | RpcErrorResponse>({
      exchange: EXCHANGES.RPC,
      routingKey,
      payload,
      timeout,
    });
  }
}