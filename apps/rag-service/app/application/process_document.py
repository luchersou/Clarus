from uuid import UUID

from app.infrastructure.llm.embedding_client import generate_embedding
from app.infrastructure.messaging.publisher import (
    publish_document_embedded,
    publish_document_embedding_failed,
)
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.infrastructure.persistence.models import DocumentChunk
from app.infrastructure.storage.supabase_storage_client import download_file
from app.infrastructure.text_extraction.extractor import extract_text_and_chunk


async def process_document(
    document_id: UUID,
    user_id: UUID,
    storage_path: str,
    file_type: str,
    repository: DocumentChunkRepository,
) -> None:
    try:
        file_bytes = await download_file(storage_path)
        text_chunks = extract_text_and_chunk(file_bytes, file_type)

        chunks: list[DocumentChunk] = []
        for chunk_index, (content, page_number) in enumerate(text_chunks):
            embedding = await generate_embedding(content)
            chunks.append(
                DocumentChunk(
                    document_id=document_id,
                    user_id=user_id,
                    content=content,
                    embedding=embedding,
                    page_number=page_number,
                    chunk_index=chunk_index,
                )
            )

        await repository.save_many(chunks)
        await publish_document_embedded(document_id=document_id, chunks_count=len(chunks))

    except Exception as exc:
        await publish_document_embedding_failed(document_id=document_id, reason=str(exc))