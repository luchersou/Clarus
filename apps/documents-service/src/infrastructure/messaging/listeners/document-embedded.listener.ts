import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import {
  EXCHANGES,
  ROUTING_KEYS,
  QUEUES,
  DocumentEmbeddedSchema,
} from "@clarus/event-contracts";
import { MarkDocumentProcessedUseCase } from "../../../application/mark-document-processed.use-case.js";

@Injectable()
export class DocumentEmbeddedListener {
  constructor(private readonly useCase: MarkDocumentProcessedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.DOCUMENT_EMBEDDED,
    queue: QUEUES.DOCUMENTS_DOCUMENT_EMBEDDED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: unknown) {
    const event = DocumentEmbeddedSchema.parse(payload);
    await this.useCase.execute({ documentId: event.documentId });
  }
}