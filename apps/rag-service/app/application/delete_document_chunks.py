import logging
from uuid import UUID

from app.infrastructure.persistence.document_chunk_repository import (
    DocumentChunkRepository,
)

logger = logging.getLogger(__name__)


async def delete_document_chunks(
    document_id: UUID,
    user_id: UUID,
    repository: DocumentChunkRepository,
) -> None:
    """Reacts to document.deleted: the document stops feeding chat answers and analyses.

    Idempotent, so a redelivered event is harmless. Chat history is kept: past answers
    stay readable, but nothing new is retrieved from the deleted document.
    """
    deleted = await repository.delete_by_document_id(document_id=document_id, user_id=user_id)
    logger.info("Deleted %d chunks of document %s", deleted, document_id)
