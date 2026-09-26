import { Injectable } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES, ROUTING_KEYS, QUEUES, AnalysisCompletedSchema } from "@clarus/event-contracts";
import { MarkAnalysisCompletedUseCase } from "../../../application/mark-analysis-completed.use-case.js";

@Injectable()
export class AnalysisCompletedListener {
  constructor(private readonly useCase: MarkAnalysisCompletedUseCase) {}

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: ROUTING_KEYS.ANALYSIS_COMPLETED,
    queue: QUEUES.ANALYSIS_ANALYSIS_COMPLETED,
    queueOptions: { deadLetterExchange: EXCHANGES.DLX },
  })
  async handle(payload: unknown) {
    const event = AnalysisCompletedSchema.parse(payload);

    await this.useCase.execute({
      analysisId: event.analysisId,
      result: event.result,
      sourcePage: event.sourcePage ?? undefined,
      confidence: event.confidence ?? undefined,
    });
  }
}