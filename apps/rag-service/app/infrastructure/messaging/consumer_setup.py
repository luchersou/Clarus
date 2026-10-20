import aio_pika

from app.infrastructure.messaging.connection import get_channel, EXCHANGE_EVENTS
from app.infrastructure.messaging.consumers.document_uploaded_consumer import (
    handle_document_uploaded,
)
from app.infrastructure.messaging.consumers.analysis_document_validated_consumer import (
    handle_analysis_document_validated,
)

QUEUE_DOCUMENT_UPLOADED = "rag.document-uploaded"
QUEUE_ANALYSIS_DOCUMENT_VALIDATED = "rag.analysis-document-validated"

ROUTING_KEY_DOCUMENT_UPLOADED = "document.uploaded"
ROUTING_KEY_ANALYSIS_DOCUMENT_VALIDATED = "analysis.document_validated"


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

    # analyses run only after documents-service validated the document
    analysis_validated_queue = await channel.declare_queue(
        QUEUE_ANALYSIS_DOCUMENT_VALIDATED, durable=True
    )
    await analysis_validated_queue.bind(
        exchange, routing_key=ROUTING_KEY_ANALYSIS_DOCUMENT_VALIDATED
    )
    await analysis_validated_queue.consume(handle_analysis_document_validated)