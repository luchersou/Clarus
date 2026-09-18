import { Module } from "@nestjs/common";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES } from "@clarus/event-contracts";

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
  exports: [RabbitMQModule],
})
export class MessagingModule {}