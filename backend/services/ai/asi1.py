"""ASI:One chat client. OpenAI-compatible HTTP API."""

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
    web_search: bool = False,
    search_context_size: str = "medium",
) -> str:
    """Return assistant text for a single prompt."""
    messages: list[dict[str, str]] = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    return await chat(
        messages,
        temperature=temperature,
        max_tokens=max_tokens,
        model=model,
        web_search=web_search,
        search_context_size=search_context_size,
    )


async def chat(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.8,
    max_tokens: int = 2048,
    model: str | None = None,
    web_search: bool = False,
    search_context_size: str = "medium",
) -> str:
    key = require_key()
    url = f"{ASI1_BASE_URL}/chat/completions"
    payload: dict[str, Any] = {
        "model": model or ASI1_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if web_search:
        payload["web_search_options"] = {"search_context_size": search_context_size}
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=180)) as resp:
            text = await resp.text()
            if resp.status != 200:
                raise ASI1Error(f"ASI:One error {resp.status}: {text[:500]}")
            data = await resp.json()
    try:
        return (data["choices"][0]["message"]["content"] or "").strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ASI1Error(f"Unexpected ASI:One response: {data!r}") from exc


async def generate_image(
    prompt: str,
    *,
    size: str = "1792x1024",
    model: str | None = None,
) -> str:
    """Return a data URL from ASI:One image generation."""
    key = require_key()
    url = f"{ASI1_BASE_URL}/image/generate"
    payload = {
        "prompt": prompt,
        "size": size,
        "model": model or ASI1_MODEL,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=180)) as resp:
            text = await resp.text()
            if resp.status != 200:
                raise ASI1Error(f"ASI:One image error {resp.status}: {text[:500]}")
            data = await resp.json()
    return _image_data_url(data)


def _image_data_url(data: dict) -> str:
    """ASI:One now returns OpenAI-style {data:[{b64_json}]} not docs {images:[{url}]}."""
    items = data.get("data") or data.get("images") or []
    if not items:
        raise ASI1Error(f"ASI:One image response had no image payload (keys={list(data.keys())})")
    item = items[0]
    if isinstance(item, str) and item.strip():
        if item.startswith("data:") or item.startswith("http"):
            return item
        mime = "image/jpeg" if item.startswith("/9j/") else "image/png"
        return f"data:{mime};base64,{item}"
    if not isinstance(item, dict):
        raise ASI1Error("ASI:One image item was not an object")
    url = str(item.get("url") or "").strip()
    if url:
        return url
    b64 = str(item.get("b64_json") or item.get("b64") or "").strip()
    if not b64:
        raise ASI1Error("ASI:One image response missing url and b64_json")
    if b64.startswith("data:"):
        return b64
    mime = "image/jpeg" if b64.startswith("/9j/") else "image/png"
    return f"data:{mime};base64,{b64}"
