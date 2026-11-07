"""ASI:One (ASI-1) chat client. OpenAI-compatible HTTP API."""

from __future__ import annotations

import os
from typing import Any

import aiohttp
from dotenv import load_dotenv

load_dotenv()

ASI1_API_KEY = os.getenv("ASI1_API_KEY", "")
ASI1_BASE_URL = os.getenv("ASI1_BASE_URL", "https://api.asi1.ai/v1").rstrip("/")
ASI1_MODEL = os.getenv("ASI1_MODEL", "asi1")


class ASI1Error(RuntimeError):
    pass


def require_key() -> str:
    if not ASI1_API_KEY:
        raise ASI1Error("ASI1_API_KEY is not set")
    return ASI1_API_KEY


async def complete(
    prompt: str,
    *,
    system: str | None = None,
    temperature: float = 0.8,
    max_tokens: int = 2048,
    model: str | None = None,
) -> str:
    """Return assistant text for a single prompt."""
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return await chat(messages, temperature=temperature, max_tokens=max_tokens, model=model)


async def chat(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.8,
    max_tokens: int = 2048,
    model: str | None = None,
) -> str:
    key = require_key()
    url = f"{ASI1_BASE_URL}/chat/completions"
    payload: dict[str, Any] = {
        "model": model or ASI1_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=180)) as resp:
            text = await resp.text()
            if resp.status != 200:
                raise ASI1Error(f"ASI-1 error {resp.status}: {text[:500]}")
            data = await resp.json()
    try:
        return (data["choices"][0]["message"]["content"] or "").strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ASI1Error(f"Unexpected ASI-1 response: {data!r}") from exc
