"""Image generation is not available on ASI-1 (text model). Keep the old API so callers don't crash."""

from typing import Optional
from uagents import Context


class ImageGenerator:
    def __init__(self, agent_context: Optional[Context] = None):
        self.agent_context = agent_context
        self.image_generation_agent = None
        self._pending_image_requests = {}
        self._last_image_url = None

    def handle_response(self, sender: str, msg) -> bool:
        return False

    async def generate(self, prompt: str, topic: Optional[str] = None, ctx: Optional[Context] = None) -> Optional[str]:
        return None
