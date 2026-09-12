import { Inject, Injectable, UseFilters } from "@nestjs/common";
import { RabbitRPC } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, RPC_ROUTING_KEYS, RPC_QUEUES } from "@clarus/event-contracts";
import { ListDocumentsUseCase } from "../../application/list-documents.use-case.js";
import { GetDocumentUseCase } from "../../application/get-document.use-case.js";
import { DeleteDocumentUseCase } from "../../application/delete-document.use-case.js";
import { FILE_STORAGE, type FileStoragePort } from "../../application/ports/file-storage.port.js";
import { DocumentResponseMapper } from "../document-response.mapper.js";
import {
  ListDocumentsPayloadSchema,
  GetDocumentPayloadSchema,
  DeleteDocumentPayloadSchema,
} from "../../application/dto/documents-rpc.dto.js"; 
import { RpcExceptionFilter } from "../filters/rpc-exception.filter.js";

@Injectable()
@UseFilters(RpcExceptionFilter)
export class DocumentsRpcHandler {
  constructor(
    private readonly listDocumentsUseCase: ListDocumentsUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly deleteDocumentUseCase: DeleteDocumentUseCase,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStoragePort,
  ) {}

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.DOCUMENTS_LIST,
    queue: RPC_QUEUES.DOCUMENTS_LIST,
  })
  async list(payload: unknown) {
    const dto = ListDocumentsPayloadSchema.parse(payload);
    const documents = await this.listDocumentsUseCase.execute(dto);

    if (documents.length === 0) return [];

    const urls = await this.fileStorage.getSignedUrls(
      documents.map((doc) => doc.storageUrl),
    );

    return documents.map((doc) =>
      DocumentResponseMapper.toHttp(doc, urls[doc.storageUrl]),
    );
  }

  @RabbitRPC({
    exchange: EXCHANGES.RPC,
    routingKey: RPC_ROUTING_KEYS.DOCUMENTS_GET_BY_ID,
    queue: RPC_QUEUES.DOCUMENTS_GET_BY_ID,
  })
  async getById(payload: unknown) {
    const dto = GetDocumentPayloadSchema.parse(payload);
    const document = await this.getDocumentUseCase.execute(dto);
    const url = await this.fileStorage.getSignedUrl(document.storageUrl);
    return DocumentResponseMapper.toHttp(document, url);
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