from google import genai

from app.core.config import settings

_client = genai.Client(api_key=settings.google_api_key)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768


async def generate_embedding(text: str) -> list[float]:
    result = await _client.aio.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={"output_dimensionality": EMBEDDING_DIMENSIONS},
    )
    return result.embeddings[0].values