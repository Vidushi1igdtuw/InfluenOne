"""LinkedIn post generation using ASI:One."""

import re
from typing import Dict, Optional
from uagents import Context

from chains.ai_chain import AIPostChain


class PostGenerator:
    def __init__(self, agent_context: Optional[Context] = None):
        self.agent_context = agent_context
        self.ai_chain = AIPostChain()

    async def generate(self, topic: str, include_hashtags: bool = True, language: str = "en") -> Dict:
        result = await self.ai_chain.generate_post(topic, language)
        if result.get("success"):
            content = result.get("content", "")
            hashtags = re.findall(r"#\w+", content) if include_hashtags else []
            return {"text": content, "hashtags": hashtags, "has_error": False}
        return {
            "text": "",
            "hashtags": [],
            "has_error": True,
            "error": result.get("error", "Failed to generate post"),
        }

    async def generate_image_prompt(self, topic: str) -> str:
        return await self.ai_chain.generate_image_prompt(topic)
