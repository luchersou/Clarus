from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.application.chat_with_documents import chat_with_documents
from app.infrastructure.persistence.chat_message_repository import ChatMessageRepository
from app.infrastructure.persistence.chat_session_repository import ChatSessionRepository
from app.infrastructure.persistence.database import get_db_session
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.infrastructure.persistence.models import ChatSession

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    user_id: UUID
    question: str
    session_id: UUID | None = None
    document_id: UUID | None = None


@router.post("")
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db_session)):
    session_repository = ChatSessionRepository(db)

    if request.session_id:
        session = await session_repository.find_by_id(request.session_id)
        if not session or session.user_id != request.user_id:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        session = ChatSession.create(user_id=request.user_id, document_id=request.document_id)
        await session_repository.save(session)

    async def event_stream():
        chunk_repository = DocumentChunkRepository(db)
        message_repository = ChatMessageRepository(db)

        yield {"event": "session", "data": str(session.id)}

        async for token in chat_with_documents(
            session_id=session.id,
            user_id=request.user_id,
            document_id=session.document_id,
            question=request.question,
            chunk_repository=chunk_repository,
            message_repository=message_repository,
        ):
            yield {"event": "message", "data": token}

        yield {"event": "done", "data": ""}

    return EventSourceResponse(event_stream())


@router.get("/sessions")
async def list_sessions(user_id: UUID, db: AsyncSession = Depends(get_db_session)):
    repository = ChatSessionRepository(db)
    sessions = await repository.find_by_user_id(user_id)
    return [{"id": s.id, "documentId": s.document_id, "createdAt": s.created_at} for s in sessions]


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: UUID, user_id: UUID, db: AsyncSession = Depends(get_db_session)
):
    session_repository = ChatSessionRepository(db)
    session = await session_repository.find_by_id(session_id)

    if not session or session.user_id != user_id:
        raise HTTPException(status_code=404, detail="Chat session not found")

    message_repository = ChatMessageRepository(db)
    messages = await message_repository.find_by_session_id(session_id)
    return [
        {"id": m.id, "role": m.role, "content": m.content, "createdAt": m.created_at}
        for m in messages
    ]