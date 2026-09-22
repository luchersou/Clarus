import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import type { RpcErrorResponse } from "./rpc-client.service.js";

const logger = new Logger();

export function mapRpcResponse<T>(response: T | RpcErrorResponse): T {
  if (isRpcErrorResponse(response)) {
    switch (response.error) {
      case "NOT_FOUND":
        throw new NotFoundException(response.message);
      case "VALIDATION_ERROR":
        throw new BadRequestException({
          message: response.message,
          details: response.details,
        });
      default:
        throw new InternalServerErrorException(response.message);
    }
  }

  return response;
}

export function mapInfrastructureError(error: unknown): never {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: unknown; status?: number } };
    logger.error(
      `RPC call failed with status ${axiosError.response?.status}`,
      JSON.stringify(axiosError.response?.data),
    );
  } else {
    logger.error("RPC call failed", error instanceof Error ? error.stack : error);
  }

  throw new ServiceUnavailableException(
    "The service is temporarily unavailable. Please try again later.",
  );
}

function isRpcErrorResponse(response: unknown): response is RpcErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    "message" in response
  );
}