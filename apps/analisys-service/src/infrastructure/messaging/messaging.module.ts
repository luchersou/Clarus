import { Module } from "@nestjs/common";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES } from "@clarus/event-contracts";
import { AnalysisEventPublisher } from "./analysis-event-publisher.js";
import { AnalysisCompletedListener } from "./listeners/analysis-completed.listener.js";
import { AnalysisFailedListener } from "./listeners/analysis-failed.listener.js";

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        { name: EXCHANGES.EVENTS, type: "topic" },
        { name: EXCHANGES.RPC, type: "topic" },
        { name: EXCHANGES.DLX, type: "topic" },
      ],
      uri: process.env.RABBITMQ_URL!,
      connectionInitOptions: { wait: true },
    }),
  ],
  providers: [
    AnalysisEventPublisher,
    AnalysisCompletedListener,
    AnalysisFailedListener,
  ],
  exports: [AnalysisEventPublisher],
})
export class MessagingModule {}