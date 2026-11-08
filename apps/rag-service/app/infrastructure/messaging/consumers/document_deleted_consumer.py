import json

from aio_pika.abc import AbstractIncomingMessage

from app.application.delete_document_chunks import delete_document_chunks
from app.infrastructure.persistence.database import async_session_factory
from app.infrastructure.persistence.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.schemas.document_deleted import DocumentDeletedEvent


async def handle_document_deleted(message: AbstractIncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body.decode())
        event = DocumentDeletedEvent(**payload)

        async with async_session_factory() as session:
            await delete_document_chunks(
                document_id=event.document_id,
                user_id=event.user_id,
                repository=DocumentChunkRepository(session),
            )
