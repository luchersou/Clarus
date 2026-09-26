from groq import AsyncGroq

from app.core.config import settings

_client = AsyncGroq(api_key=settings.groq_api_key)

CHAT_MODEL = "openai/gpt-oss-120b"


async def generate_completion(prompt: str, system_prompt: str | None = None) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    response = await _client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
    )
    return response.choices[0].message.content


async def stream_completion(prompt: str, system_prompt: str | None = None):
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    stream = await _client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        stream=True,
    )

    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content