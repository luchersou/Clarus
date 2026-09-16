from uuid import UUID

from app.infrastructure.llm.embedding_client import generate_embedding
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.infrastructure.persistence.models import DocumentChunk


async def retrieve_relevant_chunks(
    query: str,
    user_id: UUID,
    document_id: UUID | None,
    repository: DocumentChunkRepository,
    limit: int = 5,
) -> list[DocumentChunk]:
    query_embedding = await generate_embedding(query)

    return await repository.find_similar(
        embedding=query_embedding,
        user_id=user_id,
        document_id=document_id,
        limit=limit,
    )