import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { EXCHANGES } from "@clarus/event-contracts";

@Module({
  imports: [
    ConfigModule,

    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          { name: EXCHANGES.EVENTS, type: "topic" },
          { name: EXCHANGES.RPC, type: "topic" },
          { name: EXCHANGES.DLX, type: "topic" },
        ],
        uri: configService.getOrThrow<string>("RABBITMQ_URL"),
        connectionInitOptions: { wait: true },
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class MessagingModule {}