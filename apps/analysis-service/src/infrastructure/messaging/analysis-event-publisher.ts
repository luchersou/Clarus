import { Injectable } from "@nestjs/common";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, ROUTING_KEYS, AnalysisRequestedSchema } from "@clarus/event-contracts";
import type {
  AnalysisEventPublisherPort,
  AnalysisRequestedPayload,
} from "../../application/ports/analysis-event-publisher.port.js";

@Injectable()
export class AnalysisEventPublisher implements AnalysisEventPublisherPort {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  publishAnalysisRequested(payload: AnalysisRequestedPayload): void {
    const event = AnalysisRequestedSchema.parse(payload);
    this.amqpConnection.publish(EXCHANGES.EVENTS, ROUTING_KEYS.ANALYSIS_REQUESTED, event);
  }
}