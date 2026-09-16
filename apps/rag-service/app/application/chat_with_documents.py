from collections.abc import AsyncGenerator
from uuid import UUID

from app.infrastructure.llm.groq_client import stream_completion
from app.infrastructure.persistence.chat_message_repository import ChatMessageRepository
from app.infrastructure.persistence.document_chunk_repository import DocumentChunkRepository
from app.infrastructure.persistence.models import ChatMessage
from app.application.retrieval.retrieve_relevant_chunks import retrieve_relevant_chunks


async def chat_with_documents(
    session_id: UUID,
    user_id: UUID,
    document_id: UUID | None,
    question: str,
    chunk_repository: DocumentChunkRepository,
    message_repository: ChatMessageRepository,
) -> AsyncGenerator[str, None]:
    chunks = await retrieve_relevant_chunks(
        query=question,
        user_id=user_id,
        document_id=document_id,
        repository=chunk_repository,
        limit=5,
    )

    context = "\n\n".join(chunk.content for chunk in chunks)
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
        yield token

    await message_repository.save(
        ChatMessage.create(session_id=session_id, role="assistant", content=full_response)
    )