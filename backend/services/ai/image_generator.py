"""ASI:One image generation — POST /v1/image/generate."""

from typing import Optional

from uagents import Context

from services.ai.asi1 import ASI1Error, generate_image
from services.ai.image_store import persist_generated_image


class ImageGenerator:
    def __init__(self, agent_context: Optional[Context] = None):
        self.agent_context = agent_context
        self.image_generation_agent = None
        self._pending_image_requests = {}
        self._last_image_url = None

    def handle_response(self, sender: str, msg) -> bool:
        return False

    async def generate(self, prompt: str, topic: Optional[str] = None, ctx: Optional[Context] = None) -> Optional[str]:
        text = (prompt or topic or "").strip()
        if not text:
            return None
        try:
            url = await generate_image(text, size="1792x1024")
            url = persist_generated_image(url)
            self._last_image_url = url
            return url
        except ASI1Error as exc:
            if ctx:
                ctx.logger.error(f"ASI:One image failed: {exc}")
            return None
