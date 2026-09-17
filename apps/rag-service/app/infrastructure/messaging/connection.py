import aio_pika
from aio_pika.abc import AbstractChannel, AbstractExchange, AbstractRobustConnection

from app.core.config import settings

EXCHANGE_EVENTS = "clarus.events"

_connection: AbstractRobustConnection | None = None
_channel: AbstractChannel | None = None
_events_exchange: AbstractExchange | None = None


async def get_connection() -> AbstractRobustConnection:
    global _connection
    if _connection is None or _connection.is_closed:
        _connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    return _connection


async def get_channel() -> AbstractChannel:
    global _channel
    if _channel is None or _channel.is_closed:
        connection = await get_connection()
        _channel = await connection.channel()
    return _channel


async def get_events_exchange() -> AbstractExchange:
    global _events_exchange
    if _events_exchange is None:
        channel = await get_channel()
        _events_exchange = await channel.declare_exchange(
            EXCHANGE_EVENTS, aio_pika.ExchangeType.TOPIC, durable=True
        )
    return _events_exchange


async def close_connection() -> None:
    global _connection, _channel, _events_exchange
    if _channel is not None:
        await _channel.close()
    if _connection is not None:
        await _connection.close()
    _events_exchange = None