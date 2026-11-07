"""URL → LinkedIn post via ASI:One."""

from typing import Dict, Optional
from uagents import Context

from chains.ai_chain import AIPostChain


class URLExtractor:
    def __init__(self, agent_context: Optional[Context] = None):
        self.agent_context = agent_context
        self.ai_chain = AIPostChain()

    async def extract_and_convert(self, url: str, include_image: bool = False, language: str = "en") -> Dict:
        return await self.ai_chain.extract_url_to_post(url, language)
