import { Injectable } from "@nestjs/common";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import {
  EXCHANGES,
  ROUTING_KEYS,
  DocumentUploadedSchema,
  AnalysisDocumentValidatedSchema,
  AnalysisRejectedSchema,
  DocumentDeletedSchema,
} from "@clarus/event-contracts";
import type {
  AnalysisDocumentValidatedPayload,
  AnalysisRejectedPayload,
  DocumentDeletedPayload,
  DocumentEventPublisherPort,
  DocumentUploadedPayload,
} from "../../application/ports/document-event-publisher.port.js";

@Injectable()
export class DocumentEventPublisher implements DocumentEventPublisherPort {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publishDocumentUploaded(payload: DocumentUploadedPayload): Promise<void> {
    await this.publish(ROUTING_KEYS.DOCUMENT_UPLOADED, DocumentUploadedSchema.parse(payload));
  }

  async publishAnalysisDocumentValidated(payload: AnalysisDocumentValidatedPayload): Promise<void> {
    await this.publish(
      ROUTING_KEYS.ANALYSIS_DOCUMENT_VALIDATED,
      AnalysisDocumentValidatedSchema.parse(payload),
    );
  }

  async publishAnalysisRejected(payload: AnalysisRejectedPayload): Promise<void> {
    await this.publish(ROUTING_KEYS.ANALYSIS_REJECTED, AnalysisRejectedSchema.parse(payload));
  }

  async publishDocumentDeleted(payload: DocumentDeletedPayload): Promise<void> {
    await this.publish(ROUTING_KEYS.DOCUMENT_DELETED, DocumentDeletedSchema.parse(payload));
  }

  private async publish(routingKey: string, event: unknown): Promise<void> {
    await this.amqpConnection.publish(EXCHANGES.EVENTS, routingKey, event, { persistent: true });
  }
}
