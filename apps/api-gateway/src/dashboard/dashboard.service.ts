import { Injectable } from "@nestjs/common";
import { RPC_ROUTING_KEYS } from "@clarus/event-contracts";
import { RpcClientService } from "../shared/rpc-client.service.js";
import { mapRpcResponse, mapInfrastructureError } from "../shared/rpc-error.mapper.js";

interface DocumentSummary {
  status: string;
}

interface AnalysisSummary {
  status: string;
  createdAt: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly rpcClient: RpcClientService) {}

  async getSummary(userId: string): Promise<unknown> {
    try {
      const [documentsResponse, analysesResponse] = await Promise.all([
        this.rpcClient.request(RPC_ROUTING_KEYS.DOCUMENTS_LIST, { userId }),
        this.rpcClient.request(RPC_ROUTING_KEYS.ANALYSES_LIST, { userId }),
      ]);

      const documents = mapRpcResponse(documentsResponse) as DocumentSummary[];
      const analyses = mapRpcResponse(analysesResponse) as AnalysisSummary[];

      return {
        documentsCount: documents.length,
        documentsByStatus: this.countByStatus(documents),
        analysesPendingCount: analyses.filter((a) => a.status === "PENDING").length,
        recentAnalyses: analyses.slice(0, 5),
      };
    } catch (error) {
      mapInfrastructureError(error);
    }
  }

  private countByStatus(documents: DocumentSummary[]): Record<string, number> {
    return documents.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}