import { Injectable, UseFilters } from "@nestjs/common";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, RPC_ROUTING_KEYS, RPC_QUEUES } from "@clarus/event-contracts";
import { RequestAnalysisUseCase } from "../../application/request-analysis.use-case.js";
import { ListAnalysesUseCase } from "../../application/list-analyses.use-case.js";
import { GetAnalysisUseCase } from "../../application/get-analysis.use-case.js";
import { DeleteAnalysisUseCase } from "../../application/delete-analysis.use-case.js";
import { AnalysisResponseMapper } from "../analysis-response.mapper.js";
import { RpcExceptionFilter } from "../filters/rpc-exception.filter.js";
import {
  RequestAnalysisPayloadSchema,
  ListAnalysesPayloadSchema,
  GetAnalysisPayloadSchema,
  DeleteAnalysisPayloadSchema,
} from "../../application/dto/analyses-rpc.dto.js";

@Injectable()
@UseFilters(RpcExceptionFilter)
export class AnalysesRpcHandler {
  constructor(
    private readonly requestAnalysisUseCase: RequestAnalysisUseCase,
    private readonly listAnalysesUseCase: ListAnalysesUseCase,
    private readonly getAnalysisUseCase: GetAnalysisUseCase,
    private readonly deleteAnalysisUseCase: DeleteAnalysisUseCase,
  ) {}

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.ANALYSES_REQUEST,
    queue: RPC_QUEUES.ANALYSES_REQUEST,
  })
  async request(payload: unknown) {
    const dto = RequestAnalysisPayloadSchema.parse(payload);
    const analysis = await this.requestAnalysisUseCase.execute(dto);
    return AnalysisResponseMapper.toHttp(analysis);
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.ANALYSES_LIST,
    queue: RPC_QUEUES.ANALYSES_LIST,
  })
  async list(payload: unknown) {
    const dto = ListAnalysesPayloadSchema.parse(payload);
    const analyses = await this.listAnalysesUseCase.execute(dto);
    return analyses.map((analysis) => AnalysisResponseMapper.toHttp(analysis));
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.ANALYSES_GET_BY_ID,
    queue: RPC_QUEUES.ANALYSES_GET_BY_ID,
  })
  async getById(payload: unknown) {
    const dto = GetAnalysisPayloadSchema.parse(payload);
    const analysis = await this.getAnalysisUseCase.execute(dto);
    return AnalysisResponseMapper.toHttp(analysis);
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.ANALYSES_DELETE,
    queue: RPC_QUEUES.ANALYSES_DELETE,
  })
  async delete(payload: unknown) {
    const dto = DeleteAnalysisPayloadSchema.parse(payload);
    await this.deleteAnalysisUseCase.execute(dto);
    return { success: true };
  }
}