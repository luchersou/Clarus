import { Module } from "@nestjs/common";
import { MessagingModule } from "../messaging/messaging.module.js";
import { RpcClientService } from "./rpc-client.service.js";

@Module({
  imports: [MessagingModule],
  providers: [RpcClientService],
  exports: [RpcClientService],
})
export class SharedModule {}