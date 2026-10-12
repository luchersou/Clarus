import { Injectable } from "@nestjs/common";
import { defaultNackErrorHandler, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { QUEUES, EXCHANGES, ROUTING_KEYS, DocumentEmbeddingFailedSchema } from "@clarus/event-contracts";
import { MarkDocumentFailedUseCase } from "../../../application/mark-document-failed.use-case.js";

@Injectable()
export class DocumentEmbeddingFailedListener {
  constructor(private readonly useCase: MarkDocumentFailedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.DOCUMENT_EMBEDDING_FAILED,
    queue: QUEUES.DOCUMENTS_DOCUMENT_EMBEDDING_FAILED, 
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
    errorHandler: defaultNackErrorHandler,
  })
  async handle(payload: unknown) {
    const event = DocumentEmbeddingFailedSchema.parse(payload);
    await this.useCase.execute({ documentId: event.documentId, reason: event.reason });
  }
}