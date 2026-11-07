"""LinkedIn post ideas via ASI-1."""

from __future__ import annotations

import json
import re
from typing import Dict, Optional

from services.ai.asi1 import ASI1Error, complete


class IdeasGenerator:
    def __init__(self, agent_context=None):
        self.agent_context = agent_context

    async def generate(
        self,
        industry: Optional[str] = None,
        topic: Optional[str] = None,
        prompt: Optional[str] = None,
        count: int = 5,
        language: str = "en",
    ) -> Dict:
        focus = prompt or topic or industry or "technology and careers"
        n = max(1, min(int(count or 5), 12))
        instruction = f"""Give {n} LinkedIn post ideas about "{focus}".
Language: {language}
Return JSON only:
{{"ideas": [{{"title": "...", "hook": "...", "angle": "..."}}]}}
No markdown fences."""
        try:
            raw = await complete(instruction, temperature=0.9, max_tokens=1500)
        except ASI1Error as exc:
            return {"error": str(exc), "ideas": []}
        match = re.search(r"\{[\s\S]*\}", raw)
        ideas = []
        if match:
            try:
                parsed = json.loads(match.group(0))
                ideas = parsed.get("ideas") or []
            except json.JSONDecodeError:
                ideas = []
        if not ideas:
            ideas = [{"title": line.strip("-• "), "hook": "", "angle": ""} for line in raw.split("\n") if line.strip()][:n]
        return {"ideas": ideas[:n]}
