import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
import { AnalysisRejectedListener } from "./infrastructure/messaging/listeners/analysis-rejected.listener.js";
import { GetAnalysisQuotaUseCase } from "./application/get-analysis-quota.use-case.js";
import { DeleteDocumentAnalysesUseCase } from "./application/delete-document-analyses.use-case.js";
import { DocumentDeletedListener } from "./infrastructure/messaging/listeners/document-deleted.listener.js";
import { ANALYSIS_QUOTA_POLICY, type AnalysisQuotaPolicy } from "./application/analysis-quota.js";
import { ExpireStaleAnalysesUseCase } from "./application/expire-stale-analyses.use-case.js";
import { OutboxRelay } from "./infrastructure/messaging/outbox-relay.js";
import { AnalysisTimeoutScheduler } from "./infrastructure/scheduling/analysis-timeout.scheduler.js";

@Module({
  imports: [PrismaModule, MessagingModule],

  providers: [
    { provide: ANALYSIS_REPOSITORY, useClass: AnalysisPrismaRepository },
    {
      provide: ANALYSIS_QUOTA_POLICY,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AnalysisQuotaPolicy => ({
        dailyLimit: Number(config.get("ANALYSIS_DAILY_LIMIT", 20)),
      }),
    },

    RequestAnalysisUseCase,
    ListAnalysesUseCase,
    GetAnalysisUseCase,
    DeleteAnalysisUseCase,
    MarkAnalysisCompletedUseCase,
    MarkAnalysisFailedUseCase,
    ExpireStaleAnalysesUseCase,
    DeleteDocumentAnalysesUseCase,
    GetAnalysisQuotaUseCase,

    AnalysesRpcHandler,

    AnalysisCompletedListener,
    AnalysisFailedListener,
    AnalysisRejectedListener,
    DocumentDeletedListener,

    OutboxRelay,
    AnalysisTimeoutScheduler,
  ],
})
export class AnalysesModule {}