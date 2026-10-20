import { Module } from "@nestjs/common";
import { PrismaModule } from "./infrastructure/persistence/prisma.module.js";
import { MessagingModule } from "./infrastructure/messaging/messaging.module.js";
import { AnalysesRpcHandler } from "./presentation/rpc/analyses.rpc-handler.js";
import { AnalysisPrismaRepository } from "./infrastructure/persistence/analysis.prisma-repository.js";
import { ANALYSIS_REPOSITORY } from "./domain/analysis.repository.js";
import { RequestAnalysisUseCase } from "./application/request-analysis.use-case.js";
import { ListAnalysesUseCase } from "./application/list-analyses.use-case.js";
import { GetAnalysisUseCase } from "./application/get-analysis.use-case.js";
import { DeleteAnalysisUseCase } from "./application/delete-analysis.use-case.js";
import { MarkAnalysisCompletedUseCase } from "./application/mark-analysis-completed.use-case.js";
import { MarkAnalysisFailedUseCase } from "./application/mark-analysis-failed.use-case.js";
import { AnalysisCompletedListener } from "./infrastructure/messaging/listeners/analysis-completed.listener.js";
import { AnalysisFailedListener } from "./infrastructure/messaging/listeners/analysis-failed.listener.js";
import { OutboxRelay } from "./infrastructure/messaging/outbox-relay.js";

@Module({
  imports: [PrismaModule, MessagingModule],

  providers: [
    { provide: ANALYSIS_REPOSITORY, useClass: AnalysisPrismaRepository },

    RequestAnalysisUseCase,
    ListAnalysesUseCase,
    GetAnalysisUseCase,
    DeleteAnalysisUseCase,
    MarkAnalysisCompletedUseCase,
    MarkAnalysisFailedUseCase,

    AnalysesRpcHandler,

    AnalysisCompletedListener,
    AnalysisFailedListener,

    OutboxRelay,
  ],
})
export class AnalysesModule {}