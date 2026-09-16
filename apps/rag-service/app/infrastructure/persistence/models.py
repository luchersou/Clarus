import uuid
from datetime import datetime, timezone
from typing import Literal

from pgvector.sqlalchemy import Vector
from sqlalchemy import String, Text, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    __table_args__ = {"schema": "rag"}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(768), nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = {"schema": "rag"}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    document_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    messages: Mapped[list["ChatMessage"]] = relationship(back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    __table_args__ = {"schema": "rag"}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rag.chat_sessions.id"), nullable=False, index=True
    )
    role: Mapped[Literal["user", "assistant"]] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    session: Mapped["ChatSession"] = relationship(back_populates="messages")

    @staticmethod
    def create(
        session_id: uuid.UUID,
        role: Literal["user", "assistant"],
        content: str,
        sources: dict | None = None,
    ) -> "ChatMessage":
        return ChatMessage(
            id=uuid.uuid4(),
            session_id=session_id,
            role=role,
            content=content,
            sources=sources,
        )