import json

from aio_pika.abc import AbstractIncomingMessage

from app.application.run_analysis import run_analysis
from app.infrastructure.persistence.database import async_session_factory
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.schemas.analysis_requested import AnalysisRequestedEvent


async def handle_analysis_requested(message: AbstractIncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body.decode())
        event = AnalysisRequestedEvent(**payload)

        async with async_session_factory() as session:
            repository = DocumentChunkRepository(session)
            await run_analysis(
                analysis_id=event.analysis_id,
                document_id=event.document_id,
                user_id=event.user_id,
                analysis_type=event.type.value,
                repository=repository,
            )