"""LangChain post generation. The only LLM is ASI:One."""

from __future__ import annotations

import json
import os
import random
import re
from html import unescape
from typing import Dict, Optional
from urllib.parse import quote

import aiohttp
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from services.ai.asi1 import ASI1Error, complete

load_dotenv()

ASI1_API_KEY = os.getenv("ASI1_API_KEY", "")
ASI1_BASE_URL = os.getenv("ASI1_BASE_URL", "https://api.asi1.ai/v1").rstrip("/")
ASI1_MODEL = os.getenv("ASI1_MODEL", "asi1")

SYSTEM_PROMPT = """You are an expert LinkedIn content creator who writes PERSONAL, EXPERIENCE-DRIVEN posts. Generate LinkedIn posts directly - NO INTRODUCTORY TEXT, NO META-COMMENTARY.

CRITICAL RULES:
- DO NOT write "Here's a LinkedIn post..." or "Here's a draft..." or any similar meta-commentary
- DO NOT explain what you're creating or describe the post
- START IMMEDIATELY with the actual post content (hook, first sentence, etc.)
- Write as if you're posting directly on LinkedIn
- DO NOT mention dates, years, or time-specific references
- DO NOT invent sources, URLs, statistics, or quotes

CONTENT STYLE (PERSONAL & EXPERIENCE-DRIVEN):
- Write from FIRST-PERSON perspective ("I spent...", "I learned...", "I built...")
- Share PERSONAL EXPERIENCES and REAL LESSONS LEARNED
- Make it ACTIONABLE and EXPERIENCE-DRIVEN, not theoretical
- Use SHORT PARAGRAPHS or bullet points for easy skimming
- Professional, confident, and insightful tone
- End with a thoughtful question to encourage engagement
- Use emojis ONLY where they improve clarity (no overuse or decoration)

FORMATTING:
- Markdown is ok: **bold**, *italics*, `code`
- 200-300 words
- 3-5 relevant hashtags at the end
- Start with a personal hook
- End with a thoughtful question
"""

IMAGE_PROMPT_RULES = """You write one prompt for ASI:One POST https://api.asi1.ai/v1/image/generate (Innovation Lab image-generation docs).

Be specific: style, mood, lighting, composition. Use descriptive colors and textures. Name camera / viewpoint. Add setting context. Vague prompts make generic images.

Good: "A misty mountain valley at dawn with golden sunlight filtering through pine trees"
Good: "A beautiful sunset over the ocean with palm trees silhouetted against the sky"
Poor: "mountains"

This is a LinkedIn banner: landscape 1792x1024.
- Camera: 35mm or 50mm, eye-level or slight low angle, shallow depth of field
- Light: soft studio key plus golden-hour rim, high contrast
- Palette: deep navy #0B1220, electric violet #5F43F1, sky teal #3D8BD3, clean white, one gold accent
- Subject: one visual metaphor for the topic (object, architecture, or still-life)
- Style: cinematic product photography, ultra-sharp 8k
- Never: people, faces, readable text, logos, watermarks, collages, clipart

Return ONLY the image prompt as one paragraph. No quotes, no JSON, no markdown.
"""

LANGUAGE = {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "it": "Italian",
    "de": "German",
    "pt": "Portuguese",
    "nl": "Dutch",
}

HOOKS = [
    "Start with a surprising statistic or fact (only if you are sure it is real; otherwise a personal observation)",
                "Begin with a thought-provoking question",
                "Open with a bold statement or prediction",
                "Start with a personal story or anecdote",
                "Begin with a controversial opinion",
    "Open with a comparison or analogy",
            ]
            
STRUCTURES = [
                "Problem-Solution format",
                "Storytelling with beginning, middle, and end",
                "List format with actionable insights",
                "Case study format",
                "Before-After comparison",
    "Step-by-step guide format",
            ]
            
CTAS = [
                "End with a question that encourages discussion",
                "End with a call-to-action to share experiences",
                "End with a challenge for readers",
                "End with a request for opinions",
                "End with a thought-provoking statement",
    "End with an invitation to connect",
]


def _strip_meta(text: str) -> str:
    patterns = [
        r"^Here's a LinkedIn post.*?:?\s*",
        r"^Here's a draft.*?:?\s*",
        r"^Here is a LinkedIn post.*?:?\s*",
        r"^Here is a draft.*?:?\s*",
        r"^This is a LinkedIn post.*?:?\s*",
        r"^This LinkedIn post.*?:?\s*",
        r"^LinkedIn post draft.*?:?\s*",
        r"^designed to be engaging.*?:?\s*",
        r"^optimized for clarity.*?:?\s*",
        r"^incorporating real-world examples.*?:?\s*",
        r"^Below is.*?:?\s*",
        r"^Following is.*?:?\s*",
    ]
    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.MULTILINE)
    lines = []
    skip_phrases = (
        "here's a linkedin",
        "here is a linkedin",
        "this is a linkedin",
        "linkedin post draft",
        "designed to be",
        "optimized for",
    )
    for line in text.split("\n"):
        low = line.lower().strip()
        if any(p in low for p in skip_phrases):
            continue
        lines.append(line)
    return "\n".join(lines).strip()


class AIPostChain:
    """LangChain chain on ASI:One. Same public methods the rest of the app already calls."""

    def __init__(self):
        if not ASI1_API_KEY:
            raise ValueError("ASI1_API_KEY environment variable is not set")
        self.llm = ChatOpenAI(
            model=ASI1_MODEL,
            api_key=ASI1_API_KEY,
            base_url=ASI1_BASE_URL,
            temperature=0.8,
            max_tokens=2048,
        )
        self.post_chain = (
            ChatPromptTemplate.from_messages(
                [
                    ("system", SYSTEM_PROMPT),
                    ("human", "{input}"),
                ]
            )
            | self.llm
            | StrOutputParser()
        )

    def _remove_meta_commentary(self, text: str) -> str:
        return _strip_meta(text)

    def _user_prompt(self, topic: str, language_name: str) -> str:
        return f"""Generate a LinkedIn post directly. START with the post. No intro.

TOPIC: "{topic}"
LANGUAGE: {language_name}

HOOK STYLE: {random.choice(HOOKS)}
STRUCTURE: {random.choice(STRUCTURES)}
CLOSE: {random.choice(CTAS)}

RULES:
- START with the post itself. No intro.
- First person, 200-300 words
- Short paragraphs, 3-5 hashtags
- Markdown is ok: **bold**, *italics*, `code`
- Share 3-5 practical key learnings
- Include specific examples, tools, or frameworks
- End with a thoughtful question
- Do not mention years or dates
- Do not invent sources or numbers
"""

    async def generate_post(self, topic: str, language: str = "en") -> Dict:
        language_name = LANGUAGE.get(language, "English")
        try:
            content = _strip_meta(
                await complete(
                    self._user_prompt(topic, language_name),
                    system=SYSTEM_PROMPT,
                    temperature=0.8,
                    model=ASI1_MODEL,
                    web_search=True,
                    search_context_size="medium",
                )
            )
            if content:
                return {"success": True, "content": content, "error": None}
        except Exception:
            pass
        return await self._generate_direct_fallback(topic, language_name)

    async def _generate_direct_fallback(self, topic: str, language_name: str) -> Dict:
        try:
            content = _strip_meta(
                await complete(
                    self._user_prompt(topic, language_name),
                    system=SYSTEM_PROMPT,
                    temperature=0.8,
                    model=ASI1_MODEL,
                    web_search=False,
                )
            )
            return {"success": True, "content": content, "error": None}
        except ASI1Error as exc:
            return {"success": False, "content": "", "error": str(exc)}

    async def extract_url_to_post(self, url: str, language: str = "en") -> Dict:
        language_name = LANGUAGE.get(language, "English")
        title, excerpt = "", ""
        scrape_error = ""
        try:
            title, excerpt = await _fetch_url_text(url)
        except Exception as exc:
            scrape_error = str(exc)
        scraped = (excerpt or "").strip()
        thin = len(scraped) < 400
        prompt = f"""Turn this source into a LinkedIn post in {language_name}.

You have live web search. Search the URL and the title if the scrape is thin, a video, a login wall, or missing the actual body.

Source URL: {url}
Title: {title or "N/A"}
Scrape quality: {"THIN — web search is required" if thin or scrape_error else "GOOD — treat this as the primary source, search only to fill holes"}
Extracted page / video text:
{scraped[:7000] or scrape_error or "No readable HTML. Web-search this URL, summarize the real page or video, then write the post."}

RULES:
- START with the post. No meta-commentary.
- First person, 200-300 words
- Short paragraphs, 3-5 hashtags
- Markdown is ok
- End with a thoughtful question
- Do not invent dates, stats, quotes, or sources
- Stay faithful to the article / video. If you searched, only use facts from the source or search results
- Name the original piece once, naturally, without dumping the URL in the hook
- If it is a video, write from the title, channel, and description — do not invent a transcript

Return JSON:
{{"text": "...", "hashtags": ["#one", "#two"], "source_title": "..."}}
"""
        try:
            raw = await complete(
                prompt,
                system=SYSTEM_PROMPT,
                temperature=0.7,
                model=ASI1_MODEL,
                web_search=True,
                search_context_size="high",
            )
        except ASI1Error as exc:
            return {"error": str(exc)}
        parsed = _json_object(raw)
        text = _strip_meta(parsed.get("text") or raw)
        hashtags = parsed.get("hashtags") or re.findall(r"#\w+", text)
        return {
            "text": text,
            "hashtags": hashtags,
            "source_title": parsed.get("source_title") or title or "",
            "source_url": url,
        }

    async def generate_image_prompt(self, topic: str) -> str:
        prompt = f"""Write the ASI:One image prompt for this LinkedIn post theme.

Theme: "{topic}"

The image is 1792x1024 landscape. Follow every rule in the system message.
Name one visual metaphor that a founder would recognize instantly.
Include camera, lighting, materials, hex colors, and negative space.
"""
        try:
            text = await complete(
                prompt,
                system=IMAGE_PROMPT_RULES,
                temperature=0.5,
                max_tokens=420,
                model=ASI1_MODEL,
            )
            cleaned = (text or "").strip().strip('"').strip("`")
            if cleaned.lower().startswith("prompt:"):
                cleaned = cleaned[7:].strip()
            return cleaned or _fallback_image_prompt(topic)
        except ASI1Error:
            return _fallback_image_prompt(topic)


def _fallback_image_prompt(topic: str) -> str:
    subject = (topic or "a breakthrough idea").strip()[:180]
    return (
        f"Cinematic 1792x1024 LinkedIn banner, 50mm lens, eye-level, shallow depth of field: "
        f"a single sculptural still-life metaphor for {subject} on a dark navy #0B1220 studio set, "
        "brushed metal and glass, soft key light plus golden-hour rim, electric violet #5F43F1 and "
        "sky teal #3D8BD3 accents, one gold highlight, generous negative space on the right, "
        "photoreal product photography mixed with subtle 3D, ultra-sharp 8k, no people, no text, "
        "no logos, no watermark, no collage"
    )


_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
}

_LOGIN_WALL_HINTS = (
    "linkedin.com/",
    "instagram.com/",
    "facebook.com/",
    "fb.watch",
)

_VIDEO_HINTS = (
    "youtube.com/watch",
    "youtu.be/",
    "youtube.com/shorts",
    "youtube.com/live",
    "vimeo.com/",
    "tiktok.com/",
)


def _clean_text(value: str) -> str:
    text = unescape(re.sub(r"<[^>]+>", " ", value or ""))
    return re.sub(r"\s+", " ", text).strip()


def _json_at(text: str, start: int):
    try:
        obj, _ = json.JSONDecoder().raw_decode(text[start:])
        return obj
    except (json.JSONDecodeError, ValueError, TypeError):
        return None


def _meta(html: str, *keys: str) -> Optional[str]:
    for key in keys:
        patterns = [
            rf'<meta[^>]+(?:name|property|itemprop)=["\']{re.escape(key)}["\'][^>]+content=["\'](.*?)["\']',
            rf'<meta[^>]+content=["\'](.*?)["\'][^>]+(?:name|property|itemprop)=["\']{re.escape(key)}["\']',
        ]
        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
            if match:
                value = unescape(match.group(1)).replace("&nbsp;", " ").strip()
                if value:
                    return value
    return None


def _first_tag_text(html: str, tag: str) -> Optional[str]:
    match = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", html, re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    value = _clean_text(match.group(1))
    return value or None


def _ld_strings(node, *keys: str) -> list[str]:
    found: list[str] = []
    if isinstance(node, list):
        for item in node:
            found.extend(_ld_strings(item, *keys))
        return found
    if not isinstance(node, dict):
        return found
    graph = node.get("@graph")
    if isinstance(graph, list):
        found.extend(_ld_strings(graph, *keys))
    for key in keys:
        value = node.get(key)
        if isinstance(value, str) and value.strip():
            found.append(value.strip())
        elif isinstance(value, list):
            found.extend(str(item).strip() for item in value if str(item).strip())
        elif isinstance(value, dict):
            name = value.get("name") or value.get("headline")
            if isinstance(name, str) and name.strip():
                found.append(name.strip())
    return found


def _json_ld_fields(html: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for match in re.finditer(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        re.IGNORECASE | re.DOTALL,
    ):
        raw = match.group(1).strip()
        if not raw:
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            data = _json_at(raw, 0)
        if data is None:
                continue
        headlines = _ld_strings(data, "headline", "name")
        descriptions = _ld_strings(data, "description", "abstract")
        bodies = _ld_strings(data, "articleBody", "text", "transcript")
        authors = _ld_strings(data, "author")
        if headlines and "title" not in fields:
            fields["title"] = headlines[0]
        if authors and "author" not in fields:
            fields["author"] = authors[0]
        if descriptions and "description" not in fields:
            fields["description"] = descriptions[0]
        if bodies and "body" not in fields:
            fields["body"] = " ".join(bodies)
    return fields


def _visible_text(html: str) -> str:
    html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<noscript[^>]*>.*?</noscript>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<svg[^>]*>.*?</svg>", " ", html, flags=re.DOTALL | re.IGNORECASE)
    chunks: list[str] = []
    for pattern in (
        r"<article\b[^>]*>(.*?)</article>",
        r"<main\b[^>]*>(.*?)</main>",
        r'<div[^>]+(?:id|class)=["\'][^"\']*(?:article|post-content|entry-content|rich-text)[^"\']*["\'][^>]*>(.*?)</div>',
    ):
        match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
        if match:
            chunks.append(match.group(1))
            break
    paragraphs = [m.group(1) for m in re.finditer(r"<p\b[^>]*>(.*?)</p>", html, re.IGNORECASE | re.DOTALL)]
    if paragraphs:
        chunks.extend(paragraphs[:80])
    blob = " ".join(chunks) if chunks else html
    return _clean_text(blob)


def _youtube_details(html: str) -> dict[str, str]:
    details: dict[str, str] = {}
    match = re.search(r"ytInitialPlayerResponse\s*=\s*{", html)
    if not match:
        return details
    data = _json_at(html, match.end() - 1)
    if not isinstance(data, dict):
        return details
    video = data.get("videoDetails") or {}
    if not isinstance(video, dict):
        return details
    title = str(video.get("title") or "").strip()
    author = str(video.get("author") or "").strip()
    desc = str(video.get("shortDescription") or "").strip()
    keywords = video.get("keywords") or []
    if title:
        details["title"] = title
    if author:
        details["author"] = author
    if desc:
        details["description"] = desc[:5000]
    if isinstance(keywords, list) and keywords:
        details["keywords"] = ", ".join(str(k) for k in keywords[:12] if k)
    return details


def _pack_excerpt(parts: dict[str, str]) -> str:
    lines = []
    for key in ("title", "author", "site", "kind", "description", "body"):
        value = (parts.get(key) or "").strip()
        if value:
            lines.append(f"{key}: {value}")
    return "\n".join(lines).strip()


_REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=18, connect=8, sock_read=12)


async def _fetch_json(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url, headers=_BROWSER_HEADERS, timeout=_REQUEST_TIMEOUT, allow_redirects=True) as resp:
        if resp.status >= 400:
            raise RuntimeError(f"HTTP {resp.status}")
        return await resp.json(content_type=None)


async def _fetch_html(session: aiohttp.ClientSession, url: str) -> str:
    async with session.get(
        url,
        headers=_BROWSER_HEADERS,
        timeout=_REQUEST_TIMEOUT,
        allow_redirects=True,
        max_redirects=8,
    ) as resp:
        if resp.status >= 400:
            raise RuntimeError(f"HTTP {resp.status}")
        return await resp.text(errors="ignore")


async def _fetch_youtube(session: aiohttp.ClientSession, url: str) -> tuple[Optional[str], str]:
    parts: dict[str, str] = {"kind": "YouTube video"}
    try:
        data = await _fetch_json(session, f"https://www.youtube.com/oembed?url={quote(url, safe='')}&format=json")
        if data.get("title"):
            parts["title"] = str(data["title"]).strip()
        if data.get("author_name"):
            parts["author"] = str(data["author_name"]).strip()
    except Exception:
        pass
    try:
        html = await _fetch_html(session, url)
        details = _youtube_details(html)
        parts.update({k: v for k, v in details.items() if v})
        if not parts.get("title"):
            parts["title"] = _meta(html, "og:title", "twitter:title") or _first_tag_text(html, "title") or ""
        if not parts.get("description"):
            parts["description"] = _meta(html, "og:description", "twitter:description", "description") or ""
    except Exception:
        pass
    excerpt = _pack_excerpt(parts)
    if not excerpt:
        raise RuntimeError("YouTube scrape empty")
    return parts.get("title") or None, excerpt[:8000]


async def _fetch_twitter(session: aiohttp.ClientSession, url: str) -> tuple[Optional[str], str]:
    data = await _fetch_json(session, f"https://publish.twitter.com/oembed?url={quote(url, safe='')}&omit_script=true")
    title = str(data.get("author_name") or "").strip() or None
    html = str(data.get("html") or "")
    body = _clean_text(html)
    excerpt = _pack_excerpt({"kind": "social post", "author": title or "", "body": body})
    if not excerpt:
        raise RuntimeError("Twitter scrape empty")
    return title, excerpt[:8000]


async def _fetch_jina(session: aiohttp.ClientSession, url: str) -> tuple[Optional[str], str]:
    jina = f"https://r.jina.ai/{url}"
    headers = {**_BROWSER_HEADERS, "Accept": "text/plain", "X-Retain-Images": "none"}
    async with session.get(jina, headers=headers, timeout=aiohttp.ClientTimeout(total=12, connect=6, sock_read=10), allow_redirects=True) as resp:
        if resp.status >= 400:
            raise RuntimeError(f"Reader HTTP {resp.status}")
        text = await resp.text(errors="ignore")
    text = text.strip()
    if len(text) < 80:
        raise RuntimeError("Reader returned too little text")
    title = None
    match = re.search(r"^Title:\s*(.+)$", text, re.MULTILINE)
    if match:
        title = match.group(1).strip()
    return title, text[:8000]


def _parse_html(html: str) -> tuple[Optional[str], str]:
    ld = _json_ld_fields(html)
    title = (
        _meta(html, "og:title", "twitter:title")
        or ld.get("title")
        or _first_tag_text(html, "h1")
        or _first_tag_text(html, "title")
    )
    if title:
        title = _clean_text(title)
    site = _meta(html, "og:site_name") or ""
    author = _meta(html, "author", "article:author") or ld.get("author") or ""
    description = _meta(html, "og:description", "twitter:description", "description") or ld.get("description") or ""
    body = ld.get("body") or _visible_text(html)
    excerpt = _pack_excerpt(
        {
            "title": title or "",
            "author": author,
            "site": site,
            "description": description,
            "body": body,
        }
    )
    if len(excerpt) < 80 and title:
        excerpt = f"title: {title}. {excerpt}".strip()
    return title or None, excerpt[:8000]


async def _fetch_url_text(url: str) -> tuple[Optional[str], str]:
    low = url.lower()
    async with aiohttp.ClientSession(timeout=_REQUEST_TIMEOUT) as session:
        if any(hint in low for hint in _VIDEO_HINTS) and ("youtube." in low or "youtu.be" in low):
            try:
                return await _fetch_youtube(session, url)
            except Exception:
                pass
        if "twitter.com/" in low or "x.com/" in low:
            try:
                return await _fetch_twitter(session, url)
            except Exception:
                pass
        html_error = ""
        title, excerpt = "", ""
        if not any(hint in low for hint in _LOGIN_WALL_HINTS):
            try:
                html = await _fetch_html(session, url)
                title, excerpt = _parse_html(html)
            except Exception as exc:
                html_error = str(exc)
        thin = len((excerpt or "").strip()) < 400
        if thin or html_error:
            try:
                jina_title, jina_text = await _fetch_jina(session, url)
                jina_bad = "returned error" in jina_text[:500].lower() or "warning:" in jina_text[:500].lower()
                if not jina_bad and len(jina_text) > len(excerpt or ""):
                    title = title or jina_title
                    excerpt = jina_text
            except Exception:
                if html_error and not excerpt:
                    raise RuntimeError(html_error)
        if not (excerpt or "").strip():
            raise RuntimeError("No readable text from URL")
        return title or None, excerpt[:8000]


def _json_object(raw: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        return {}
    try:
        data = json.loads(match.group(0))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}
