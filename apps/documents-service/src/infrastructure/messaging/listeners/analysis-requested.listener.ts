import { Injectable } from "@nestjs/common";
import { defaultNackErrorHandler, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import {
  EXCHANGES,
  ROUTING_KEYS,
  QUEUES,
  AnalysisRequestedSchema,
} from "@clarus/event-contracts";
import { ValidateAnalysisRequestUseCase } from "../../../application/validate-analysis-request.use-case.js";

@Injectable()
export class AnalysisRequestedListener {
  constructor(private readonly useCase: ValidateAnalysisRequestUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.ANALYSIS_REQUESTED,
    queue: QUEUES.DOCUMENTS_ANALYSIS_REQUESTED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
    errorHandler: defaultNackErrorHandler,
  })
  async handle(payload: unknown) {
    const event = AnalysisRequestedSchema.parse(payload);
    await this.useCase.execute(event);
  }
}
