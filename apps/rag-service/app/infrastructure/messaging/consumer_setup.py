import aio_pika

from app.infrastructure.messaging.connection import get_channel, EXCHANGE_EVENTS
from app.infrastructure.messaging.consumers.document_uploaded_consumer import (
    handle_document_uploaded,
)
from app.infrastructure.messaging.consumers.analysis_requested_consumer import (
    handle_analysis_requested,
)

QUEUE_DOCUMENT_UPLOADED = "rag.document-uploaded"
QUEUE_ANALYSIS_REQUESTED = "rag.analysis-requested"

ROUTING_KEY_DOCUMENT_UPLOADED = "document.uploaded"
ROUTING_KEY_ANALYSIS_REQUESTED = "analysis.requested"


async def setup_consumers() -> None:
    channel = await get_channel()
    exchange = await channel.declare_exchange(
        EXCHANGE_EVENTS, aio_pika.ExchangeType.TOPIC, durable=True
    )

    document_uploaded_queue = await channel.declare_queue(
        QUEUE_DOCUMENT_UPLOADED, durable=True
    )
    await document_uploaded_queue.bind(exchange, routing_key=ROUTING_KEY_DOCUMENT_UPLOADED)
    await document_uploaded_queue.consume(handle_document_uploaded)

    analysis_requested_queue = await channel.declare_queue(
        QUEUE_ANALYSIS_REQUESTED, durable=True
    )
    await analysis_requested_queue.bind(exchange, routing_key=ROUTING_KEY_ANALYSIS_REQUESTED)
    await analysis_requested_queue.consume(handle_analysis_requested)