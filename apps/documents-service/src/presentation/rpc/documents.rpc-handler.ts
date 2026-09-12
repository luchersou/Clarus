import { Injectable } from "@nestjs/common";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, RPC_ROUTING_KEYS, RPC_QUEUES } from "@clarus/event-contracts";
import { ListDocumentsUseCase } from "../../application/list-documents.use-case.js";
import { GetDocumentUseCase } from "../../application/get-document.use-case.js";
import { DeleteDocumentUseCase } from "../../application/delete-document.use-case.js";
import { DocumentResponseMapper } from "../document-response.mapper.js";
import {
  ListDocumentsPayloadSchema,
  GetDocumentPayloadSchema,
  DeleteDocumentPayloadSchema,
} from "../../application/dto/documents-rpc.dto.js";

@Injectable()
export class DocumentsRpcHandler {
  constructor(
    private readonly listDocumentsUseCase: ListDocumentsUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
  ) {}

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.DOCUMENTS_LIST,
    queue: RPC_QUEUES.DOCUMENTS_LIST,
  })
  async list(payload: unknown) {
    const dto = ListDocumentsPayloadSchema.parse(payload);
    const documents = await this.listDocumentsUseCase.execute(dto);
    return documents.map(DocumentResponseMapper.toHttp);
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.DOCUMENTS_GET_BY_ID,
    queue: RPC_QUEUES.DOCUMENTS_GET_BY_ID,
  })
  async getById(payload: unknown) {
    const dto = GetDocumentPayloadSchema.parse(payload);
    const document = await this.getDocumentUseCase.execute(dto);
    return DocumentResponseMapper.toHttp(document);
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.DOCUMENTS_DELETE,
    queue: RPC_QUEUES.DOCUMENTS_DELETE,
  })
  async delete(payload: unknown) {
    const dto = DeleteDocumentPayloadSchema.parse(payload);
    await this.deleteDocumentUseCase.execute(dto);
    return { success: true };
  }
}