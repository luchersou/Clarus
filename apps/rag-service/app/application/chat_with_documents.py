from collections.abc import AsyncGenerator
from dataclasses import dataclass
from uuid import UUID

from app.application.retrieval.retrieve_relevant_chunks import (
    ScoredChunk,
    retrieve_scored_chunks,
)
from app.infrastructure.llm.groq_client import stream_completion
from app.infrastructure.persistence.chat_message_repository import ChatMessageRepository
from app.infrastructure.persistence.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.infrastructure.persistence.models import ChatMessage


@dataclass(frozen=True)
class AnswerToken:
    text: str


@dataclass(frozen=True)
class AnswerSources:
    # [{"documentId": str, "page": int, "confidence": float}], best match first
    sources: list[dict]


def build_sources(chunks: list[ScoredChunk]) -> list[dict]:
    """One entry per (document, page), keeping the best similarity of the chunks there."""
    best: dict[tuple[UUID, int], float] = {}
    for item in chunks:
        key = (item.chunk.document_id, item.chunk.page_number)
        best[key] = max(best.get(key, 0.0), item.similarity)

    ranked = sorted(best.items(), key=lambda entry: entry[1], reverse=True)
    return [
        {
            "documentId": str(document_id),
            "page": page,
            "confidence": round(max(0.0, min(1.0, similarity)), 4),
        }
        for (document_id, page), similarity in ranked
    ]


async def chat_with_documents(
    session_id: UUID,
    user_id: UUID,
    document_id: UUID | None,
    question: str,
    chunk_repository: DocumentChunkRepository,
    message_repository: ChatMessageRepository,
) -> AsyncGenerator[AnswerToken | AnswerSources, None]:
    chunks = await retrieve_scored_chunks(
        query=question,
        user_id=user_id,
        document_id=document_id,
        repository=chunk_repository,
        limit=5,
    )

    context = "\n\n".join(item.chunk.content for item in chunks)
    system_prompt = (
        "You are a helpful assistant that answers questions based only on the "
        "provided document excerpts. If the answer isn't in the excerpts, say so."
    )
    prompt = f"Document excerpts:\n{context}\n\nQuestion: {question}"

    await message_repository.save(
        ChatMessage.create(session_id=session_id, role="user", content=question)
    )

    full_response = ""
    async for token in stream_completion(prompt, system_prompt=system_prompt):
        full_response += token
        yield AnswerToken(text=token)

    # Sent after the answer, so the source cards show up once it's complete.
    sources = build_sources(chunks)
    yield AnswerSources(sources=sources)

    await message_repository.save(
        ChatMessage.create(
            session_id=session_id,
            role="assistant",
            content=full_response,
            sources=sources or None,
        )
    )
