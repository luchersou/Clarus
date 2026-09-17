import json
from uuid import UUID

import aio_pika

from app.infrastructure.messaging.connection import get_events_exchange
from app.schemas.document_embedded import DocumentEmbeddedEvent
from app.schemas.analysis_completed import AnalysisCompletedEvent

ROUTING_KEY_DOCUMENT_EMBEDDED = "document.embedded"
ROUTING_KEY_DOCUMENT_EMBEDDING_FAILED = "document.embedding_failed"
ROUTING_KEY_ANALYSIS_COMPLETED = "analysis.completed"
ROUTING_KEY_ANALYSIS_FAILED = "analysis.failed"


async def publish_document_embedded(document_id: UUID, chunks_count: int) -> None:
    event = DocumentEmbeddedEvent(document_id=document_id, chunks_count=chunks_count)
    await _publish(ROUTING_KEY_DOCUMENT_EMBEDDED, event.model_dump_json(by_alias=True))


async def publish_document_embedding_failed(document_id: UUID, reason: str) -> None:
    payload = {"documentId": str(document_id), "reason": reason}
    await _publish(ROUTING_KEY_DOCUMENT_EMBEDDING_FAILED, json.dumps(payload))


async def publish_analysis_completed(
    analysis_id: UUID, result: dict, source_page: int | None = None
) -> None:
    event = AnalysisCompletedEvent(analysis_id=analysis_id, result=result, source_page=source_page)
    await _publish(ROUTING_KEY_ANALYSIS_COMPLETED, event.model_dump_json(by_alias=True))


async def publish_analysis_failed(analysis_id: UUID, reason: str) -> None:
    payload = {"analysisId": str(analysis_id), "reason": reason}
    await _publish(ROUTING_KEY_ANALYSIS_FAILED, json.dumps(payload))


async def _publish(routing_key: str, body: str) -> None:
    exchange = await get_events_exchange()
    await exchange.publish(
        aio_pika.Message(body=body.encode()),
        routing_key=routing_key,
    )