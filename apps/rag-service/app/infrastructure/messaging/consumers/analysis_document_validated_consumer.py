import json
import logging

from aio_pika.abc import AbstractIncomingMessage

from app.application.run_analysis import run_analysis
from app.infrastructure.persistence.database import async_session_factory
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.infrastructure.persistence.processed_analysis_repository import (
    ProcessedAnalysisRepository,
)
from app.schemas.analysis_document_validated import AnalysisDocumentValidatedEvent

logger = logging.getLogger(__name__)


async def handle_analysis_document_validated(message: AbstractIncomingMessage) -> None:
    async with message.process():
        payload = json.loads(message.body.decode())
        event = AnalysisDocumentValidatedEvent(**payload)

        async with async_session_factory() as session:
            # events are delivered at least once; a redelivered analysis must not run the LLM again
            claimed = await ProcessedAnalysisRepository(session).try_claim(event.analysis_id)
            if not claimed:
                logger.info("Analysis %s was already processed, skipping", event.analysis_id)
                return

            repository = DocumentChunkRepository(session)
            await run_analysis(
                analysis_id=event.analysis_id,
                document_id=event.document_id,
                user_id=event.user_id,
                analysis_type=event.type.value,
                repository=repository,
            )
