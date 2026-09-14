import { Module } from "@nestjs/common";
import { PrismaModule } from "./infrastructure/persistence/prisma.module.js";
import { MessagingModule } from "./infrastructure/messaging/messaging.module.js";
import { AnalysesRpcHandler } from "./presentation/rpc/analyses.rpc-handler.js";
import { AnalysisPrismaRepository } from "./infrastructure/persistence/analysis.prisma-repository.js";
import { ANALYSIS_REPOSITORY } from "./domain/analysis.repository.js";
import { AnalysisEventPublisher } from "./infrastructure/messaging/analysis-event-publisher.js";
import { ANALYSIS_EVENT_PUBLISHER } from "./application/ports/analysis-event-publisher.port.js";
import { RequestAnalysisUseCase } from "./application/request-analysis.use-case.js";
import { ListAnalysesUseCase } from "./application/list-analyses.use-case.js";
import { GetAnalysisUseCase } from "./application/get-analysis.use-case.js";
import { DeleteAnalysisUseCase } from "./application/delete-analysis.use-case.js";
import { MarkAnalysisCompletedUseCase } from "./application/mark-analysis-completed.use-case.js";
import { MarkAnalysisFailedUseCase } from "./application/mark-analysis-failed.use-case.js";

@Module({
  imports: [PrismaModule, MessagingModule],
  providers: [
    { provide: ANALYSIS_REPOSITORY, useClass: AnalysisPrismaRepository },
    { provide: ANALYSIS_EVENT_PUBLISHER, useClass: AnalysisEventPublisher },
    RequestAnalysisUseCase,
    ListAnalysesUseCase,
    GetAnalysisUseCase,
    DeleteAnalysisUseCase,
    MarkAnalysisCompletedUseCase,
    MarkAnalysisFailedUseCase,
    AnalysesRpcHandler,
  ],
})
export class AnalysesModule {}