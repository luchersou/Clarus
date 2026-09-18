import { Injectable } from "@nestjs/common";
import { RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { RpcClientService } from "../shared/rpc-client.service.js";
import { mapRpcResponse, mapInfrastructureError } from "../shared/rpc-error.mapper.js";

@Injectable()
export class AnalysesService {
  constructor(private readonly rpcClient: RpcClientService) {}

  async request(documentId: string, userId: string, type: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.ANALYSES_REQUEST, {
        documentId,
        userId,
        type,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async list(userId: string, documentId?: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.ANALYSES_LIST, {
        userId,
        ...(documentId && { documentId }),
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async getById(analysisId: string, userId: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.ANALYSES_GET_BY_ID, {
        analysisId,
        userId,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  async delete(analysisId: string, userId: string): Promise<unknown> {
    try {
      const response = await this.rpcClient.request(RPC_ROUTING_KEYS.ANALYSES_DELETE, {
        analysisId,
        userId,
      });
      return mapRpcResponse(response);
    } catch (error) {
      mapInfrastructureError(error);
    }
  }
}