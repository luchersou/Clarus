from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.persistence.models import DocumentChunk


class DocumentChunkRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save_many(self, chunks: list[DocumentChunk]) -> None:
        self.session.add_all(chunks)
        await self.session.commit()

    async def find_by_document_id(self, document_id: UUID) -> list[DocumentChunk]:
        result = await self.session.execute(
            select(DocumentChunk).where(DocumentChunk.document_id == document_id)
        )
        return list(result.scalars().all())

    async def delete_by_document_id(self, document_id: UUID, user_id: UUID) -> int:
        # Scoped to the owner too, so a forged event can't wipe another user's chunks.
        result = await self.session.execute(
            delete(DocumentChunk).where(
                DocumentChunk.document_id == document_id,
                DocumentChunk.user_id == user_id,
            )
        )
        await self.session.commit()
        return result.rowcount or 0

    async def find_similar(
        self, embedding: list[float], user_id: UUID, document_id: UUID | None, limit: int = 5
    ) -> list[DocumentChunk]:
        query = select(DocumentChunk).where(DocumentChunk.user_id == user_id)

        if document_id:
            query = query.where(DocumentChunk.document_id == document_id)

        query = query.order_by(DocumentChunk.embedding.cosine_distance(embedding)).limit(limit)

        result = await self.session.execute(query)
        return list(result.scalars().all())