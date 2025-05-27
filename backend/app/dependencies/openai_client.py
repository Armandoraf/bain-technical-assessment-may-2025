from fastapi import Request
from openai import AsyncOpenAI
import os

DEFAULT_CLIENT = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def get_openai_client(request: Request) -> AsyncOpenAI:
    """
    Return a per-request OpenAI client initialised with the caller’s key,
    or the server’s fallback client when the header is missing.
    """
    key = request.headers.get("x-openai-api-key")
    if key:
        return AsyncOpenAI(api_key=key)
    return DEFAULT_CLIENT
