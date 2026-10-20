import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, ROUTING_KEYS, QUEUES, DocumentDeletedSchema } from "@clarus/event-contracts";
import { DeleteDocumentAnalysesUseCase } from "../../../application/delete-document-analyses.use-case.js";

@Injectable()
export class DocumentDeletedListener {
  constructor(private readonly useCase: DeleteDocumentAnalysesUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.DOCUMENT_DELETED,
    queue: QUEUES.ANALYSIS_DOCUMENT_DELETED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: unknown) {
    const event = DocumentDeletedSchema.parse(payload);

    await this.useCase.execute({
      documentId: event.documentId,
      userId: event.userId,
    });
  }
}
