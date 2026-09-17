from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.chat_router import router as chat_router
from app.infrastructure.messaging.connection import close_connection
from app.infrastructure.messaging.consumer_setup import setup_consumers


@asynccontextmanager
async def lifespan(app: FastAPI):
    await setup_consumers()
    yield
    await close_connection()


app = FastAPI(title="Clarus RAG Service", lifespan=lifespan)

app.include_router(chat_router)