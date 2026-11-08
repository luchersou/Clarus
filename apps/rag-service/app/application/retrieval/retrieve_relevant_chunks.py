from dataclasses import dataclass
from uuid import UUID

from app.infrastructure.llm.embedding_client import generate_embedding
from app.infrastructure.persistence.document_chunk_repository import (
    DocumentChunkRepository,
)
from app.infrastructure.persistence.models import DocumentChunk


@dataclass(frozen=True)
class ScoredChunk:
    chunk: DocumentChunk
    similarity: float


async def retrieve_scored_chunks(
    query: str,
    user_id: UUID,
    document_id: UUID | None,
    repository: DocumentChunkRepository,
    limit: int = 5,
) -> list[ScoredChunk]:
    query_embedding = await generate_embedding(query)

    matches = await repository.find_similar(
        embedding=query_embedding,
        user_id=user_id,
        document_id=document_id,
        limit=limit,
    )
    return [ScoredChunk(chunk=chunk, similarity=similarity) for chunk, similarity in matches]


async def retrieve_relevant_chunks(
    query: str,
    user_id: UUID,
    document_id: UUID | None,
    repository: DocumentChunkRepository,
    limit: int = 5,
) -> list[DocumentChunk]:
    scored = await retrieve_scored_chunks(query, user_id, document_id, repository, limit)
    return [item.chunk for item in scored]
