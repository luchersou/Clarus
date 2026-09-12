import { Injectable } from "@nestjs/common";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
  EXCHANGES,
  ROUTING_KEYS,
  DocumentUploadedSchema,
} from "@clarus/event-contracts";
import type {
  DocumentEventPublisherPort,
  DocumentUploadedPayload,
} from "../../application/ports/document-event-publisher.port.js";

@Injectable()
export class DocumentEventPublisher implements DocumentEventPublisherPort {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishDocumentUploaded(payload: DocumentUploadedPayload): void {
    const event = DocumentUploadedSchema.parse(payload);
    this.amqpConnection.publish(EXCHANGES.EVENTS, ROUTING_KEYS.DOCUMENT_UPLOADED, event);
  }
}