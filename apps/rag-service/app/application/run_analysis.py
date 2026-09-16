from uuid import UUID

from app.infrastructure.llm.groq_client import generate_completion
from app.infrastructure.messaging.publisher import (
    publish_analysis_completed,
    publish_analysis_failed,
)
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.application.retrieval.retrieve_relevant_chunks import retrieve_relevant_chunks

ANALYSIS_PROMPTS = {
    "SUMMARY": "Summarize the following document excerpts in a clear and concise way.",
    "EXTRACT_VALUES": "Extract key values, numbers, and structured data from the following document excerpts. Return them as a clear list.",
    "DEADLINES": "Identify all deadlines and important dates mentioned in the following document excerpts.",
    "COMPARE": "Compare the information across the following document excerpts, highlighting similarities and differences.",
}


async def run_analysis(
    analysis_id: UUID,
    document_id: UUID,
    user_id: UUID,
    analysis_type: str,
    repository: DocumentChunkRepository,
) -> None:
    try:
        chunks = await retrieve_relevant_chunks(
            query=ANALYSIS_PROMPTS[analysis_type],
            user_id=user_id,
            document_id=document_id,
            repository=repository,
            limit=8,
        )

        if not chunks:
            raise ValueError("No relevant content found for this document")

        context = "\n\n".join(chunk.content for chunk in chunks)
        prompt = f"{ANALYSIS_PROMPTS[analysis_type]}\n\nDocument excerpts:\n{context}"

        result_text = await generate_completion(prompt)

        await publish_analysis_completed(
            analysis_id=analysis_id,
            result={"content": result_text},
            source_page=chunks[0].page_number,
        )

    except Exception as exc:
        await publish_analysis_failed(analysis_id=analysis_id, reason=str(exc))