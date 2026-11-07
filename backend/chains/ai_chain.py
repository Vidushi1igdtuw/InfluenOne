"""LangChain post generation. The only LLM is ASI-1."""

from __future__ import annotations

import json
import os
import random
import re
from html import unescape
from typing import Dict, Optional

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

IMAGE_PROMPT_RULES = """Create a PROFESSIONAL, CLEAN image prompt for a LinkedIn featured graphic.

REQUIREMENTS:
- Professional, minimalist, modern
- No people, no stock-photo look, no cartoons
- Clean composition, high contrast, easy to read
- Blues, teals, grays, one accent color
- Visual metaphor for the topic, not clutter

AVOID:
- Generic stock photos
- Overused clichés
- Busy or low-contrast layouts

Return ONLY the image prompt. No JSON, no markdown, no explanation.
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
    """LangChain chain on ASI-1. Same public methods the rest of the app already calls."""

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
            content = await self.post_chain.ainvoke({"input": self._user_prompt(topic, language_name)})
            content = self._remove_meta_commentary(content or "")
            if not content:
                return await self._generate_direct_fallback(topic, language_name)
            return {"success": True, "content": content, "error": None}
        except Exception:
            return await self._generate_direct_fallback(topic, language_name)

    async def _generate_direct_fallback(self, topic: str, language_name: str) -> Dict:
        try:
            content = _strip_meta(
                await complete(
                    self._user_prompt(topic, language_name),
                    system=SYSTEM_PROMPT,
                    temperature=0.8,
                    model=ASI1_MODEL,
                )
            )
            return {"success": True, "content": content, "error": None}
        except ASI1Error as exc:
            return {"success": False, "content": "", "error": str(exc)}

    async def extract_url_to_post(self, url: str, language: str = "en") -> Dict:
        language_name = LANGUAGE.get(language, "English")
        try:
            title, excerpt = await _fetch_url_text(url)
        except Exception as exc:
            return {"error": f"Failed to fetch URL: {exc}"}
        prompt = f"""Turn this article into a LinkedIn post in {language_name}.

Source URL: {url}
Title: {title or "N/A"}
Excerpt:
{excerpt[:3000]}

RULES:
- START with the post. No meta-commentary.
- First person, 200-300 words
- Short paragraphs, 3-5 hashtags
- Markdown is ok
- End with a thoughtful question
- Do not invent dates or sources
- Stay faithful to the article

Return JSON:
{{"text": "...", "hashtags": ["#one", "#two"]}}
"""
        try:
            raw = await self.post_chain.ainvoke({"input": prompt})
        except Exception:
            try:
                raw = await complete(prompt, system=SYSTEM_PROMPT, temperature=0.7, model=ASI1_MODEL)
            except ASI1Error as exc:
                return {"error": str(exc)}
        parsed = _json_object(raw)
        text = _strip_meta(parsed.get("text") or raw)
        hashtags = parsed.get("hashtags") or re.findall(r"#\w+", text)
        return {"text": text, "hashtags": hashtags, "source_title": title or "", "source_url": url}

    async def generate_image_prompt(self, topic: str) -> str:
        prompt = f"""Topic: "{topic}"

{IMAGE_PROMPT_RULES}
"""
        try:
            text = await self.post_chain.ainvoke({"input": prompt})
            return (text or "").strip() or f"Professional illustration related to {topic}, modern business style, clean design"
        except Exception:
            try:
                return await complete(prompt, system=IMAGE_PROMPT_RULES, temperature=0.7, max_tokens=256, model=ASI1_MODEL)
            except ASI1Error:
                return f"Professional illustration related to {topic}, modern business style, clean design"


async def _fetch_url_text(url: str) -> tuple[Optional[str], str]:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; InfluenOne/1.0)"}
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            if resp.status != 200:
                raise RuntimeError(f"HTTP {resp.status}")
            html = await resp.text()
    html = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    title = unescape(title_match.group(1).strip()) if title_match else None
    text = unescape(re.sub(r"<[^>]+>", " ", html))
    text = re.sub(r"\s+", " ", text).strip()
    return title, text[:5000]


def _json_object(raw: str) -> dict:
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        return {}
    try:
        data = json.loads(match.group(0))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}
