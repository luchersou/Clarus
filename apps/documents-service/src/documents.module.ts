import { Module } from "@nestjs/common";
import { PrismaModule } from "./infrastructure/persistence/prisma.module.js";
import { MessagingModule } from "./infrastructure/messaging/rabbitmq.module.js";
import { DocumentsController } from "./presentation/documents.controller.js";
import { DocumentsRpcHandler } from "./presentation/rpc/documents.rpc-handler.js";
import { DocumentPrismaRepository } from "./infrastructure/persistence/document.prisma-repository.js";
import { DOCUMENT_REPOSITORY } from "./domain/document.repository.js";
import { SupabaseStorageService } from "./infrastructure/storage/supabase-storage.service.js";
import { FILE_STORAGE } from "./application/ports/file-storage.port.js";
import { DocumentEventPublisher } from "./infrastructure/messaging/document-event-publisher.js";
import { DOCUMENT_EVENT_PUBLISHER } from "./application/ports/document-event-publisher.port.js";
import { UploadDocumentUseCase } from "./application/upload-document.use-case.js";
import { ListDocumentsUseCase } from "./application/list-documents.use-case.js";
import { GetDocumentUseCase } from "./application/get-document.use-case.js";
import { DeleteDocumentUseCase } from "./application/delete-document.use-case.js";
import { MarkDocumentProcessedUseCase } from "./application/mark-document-processed.use-case.js";
import { MarkDocumentFailedUseCase } from "./application/mark-document-failed.use-case.js";
import { DocumentEmbeddedListener } from "./infrastructure/messaging/listeners/document-embedded.listener.js";
import { DocumentEmbeddingFailedListener } from "./infrastructure/messaging/listeners/document-embedding-failed.listener.js";

@Module({
  imports: [PrismaModule, MessagingModule],
  controllers: [DocumentsController],
  providers: [
    { provide: DOCUMENT_REPOSITORY, useClass: DocumentPrismaRepository },
    { provide: FILE_STORAGE, useClass: SupabaseStorageService },
    { provide: DOCUMENT_EVENT_PUBLISHER, useClass: DocumentEventPublisher },
    UploadDocumentUseCase,
    ListDocumentsUseCase,
    GetDocumentUseCase,
    DeleteDocumentUseCase,
    MarkDocumentProcessedUseCase,
    MarkDocumentFailedUseCase,
    DocumentsRpcHandler,
    DocumentEmbeddedListener,
    DocumentEmbeddingFailedListener,
  ],
})
export class DocumentsModule {}