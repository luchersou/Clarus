import { Module } from "@nestjs/common";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES } from "@clarus/event-contracts";
import { DocumentEventPublisher } from "./document-event-publisher.js";
import { DocumentEmbeddedListener } from "./listeners/document-embedded.listener.js";
import { DocumentEmbeddingFailedListener } from "./listeners/document-embedding-failed.listener.js";

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
    DocumentEventPublisher,
    DocumentEmbeddedListener,
    DocumentEmbeddingFailedListener,
  ],
  exports: [DocumentEventPublisher],
})
export class MessagingModule {}