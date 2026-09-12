import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { QUEUES, EXCHANGES, ROUTING_KEYS } from "@clarus/event-contracts";
import { MarkDocumentFailedUseCase } from "../../../application/mark-document-failed.use-case.js";

@Injectable()
export class DocumentEmbeddingFailedListener {
  constructor(private readonly useCase: MarkDocumentFailedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED,
    queue: QUEUES.DOCUMENTS_DOCUMENT_EMBEDDING_FAILED, 
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: { documentId: string; reason: string }) {
    await this.useCase.execute({ documentId: payload.documentId, reason: payload.reason });
  }
}