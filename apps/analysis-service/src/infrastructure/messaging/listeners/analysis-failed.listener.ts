import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, ROUTING_KEYS, QUEUES, AnalysisFailedSchema } from "@clarus/event-contracts";
import { MarkAnalysisFailedUseCase } from "../../../application/mark-analysis-failed.use-case.js";

@Injectable()
export class AnalysisFailedListener {
  constructor(private readonly useCase: MarkAnalysisFailedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.ANALYSIS_FAILED,
    queue: QUEUES.ANALYSIS_ANALYSIS_FAILED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: unknown) {
    const event = AnalysisFailedSchema.parse(payload);

    await this.useCase.execute({
      analysisId: event.analysisId,
      reason: event.reason,
    });
  }
}