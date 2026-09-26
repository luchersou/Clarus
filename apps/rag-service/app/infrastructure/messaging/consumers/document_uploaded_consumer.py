import json
from uuid import UUID

from aio_pika.abc import AbstractIncomingMessage

from app.application.process_document import process_document
from app.infrastructure.persistence.database import async_session_factory
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.schemas.document_uploaded import DocumentUploadedEvent


async def handle_document_uploaded(message: AbstractIncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body.decode())
        event = DocumentUploadedEvent(**payload)

        async with async_session_factory() as session:
            repository = DocumentChunkRepository(session)
            await process_document(
                document_id=event.document_id,
                user_id=event.user_id,
                storage_path=event.storage_url,
                file_type=event.file_type.value,
                repository=repository,
            )