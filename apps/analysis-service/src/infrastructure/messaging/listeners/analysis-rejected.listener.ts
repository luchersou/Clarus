import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, ROUTING_KEYS, QUEUES, AnalysisRejectedSchema } from "@clarus/event-contracts";
import { MarkAnalysisFailedUseCase } from "../../../application/mark-analysis-failed.use-case.js";

/** documents-service refused the analysis (missing or unprocessed document). */
@Injectable()
export class AnalysisRejectedListener {
  constructor(private readonly useCase: MarkAnalysisFailedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.ANALYSIS_REJECTED,
    queue: QUEUES.ANALYSIS_ANALYSIS_REJECTED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: unknown) {
    const event = AnalysisRejectedSchema.parse(payload);

    await this.useCase.execute({
      analysisId: event.analysisId,
      reason: event.reason,
    });
  }
}
