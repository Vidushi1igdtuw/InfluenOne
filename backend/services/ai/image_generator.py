"""ASI:One image generation — POST /v1/image/generate."""

import re
from typing import Optional

from uagents import Context

from services.ai.asi1 import ASI1Error, generate_image
from services.ai.image_store import persist_generated_image

# Prompts that already carry image-direction clues (size, palette, camera,
# composition, negative constraints) are forwarded as-is — the post pipeline
# crafts those. Anything else (a raw topic, a short snippet) is rewritten into
# a full brand-styled prompt so the image stays on-topic instead of coming out
# generic / out-of-context.
_STYLE_HINT = re.compile(
    r"(1792|1024|palette|#[0-9a-fA-F]{6}|camera|lens|lighting|metaphor"
    r"|illustration|flat[- ]style|isometric|composition|no text|no people"
    r"|no logos|watermark)",
    re.IGNORECASE,
)


class ImageGenerator:
    def __init__(self, agent_context: Optional[Context] = None):
        self.agent_context = agent_context
        self.image_generation_agent = None
        self._pending_image_requests = {}
        self._last_image_url = None

    def handle_response(self, sender: str, msg) -> bool:
        return False

    @staticmethod
    def _compose_contextual_prompt(text: str) -> str:
        """Turn a raw topic/snippet into a full, brand-styled image prompt.

        Reuses AIPostChain's deterministic fallback writer so direct calls
        produce the same grounded prompts the post pipeline uses. Lazy import
        keeps module load safe from circular imports.
        """
        try:
            from chains.ai_chain import _fallback_image_prompt

            return _fallback_image_prompt(text)
        except Exception:  # noqa: BLE001 — prompt polish must never fail generation
            subject = (text or "a breakthrough idea").strip()[:180]
            return (
                f"Editorial illustration visualizing: {subject}. "
                "One clear visual metaphor, flat modern style, deep navy "
                "#0B1220, violet #5F43F1 and teal #3D8BD3 palette, no text, "
                "no people, no logos."
            )

    async def generate(
        self, prompt: str, topic: Optional[str] = None, ctx: Optional[Context] = None
    ) -> Optional[str]:
        text = (prompt or "").strip()
        if not text:
            text = (topic or "").strip()
        if not text:
            return None

        # A raw/short prompt without image-direction hints yields an
        # out-of-context image. Rewrite it into a grounded, styled prompt.
        if len(text) < 120 and not _STYLE_HINT.search(text):
            base = (topic or text).strip()
            text = self._compose_contextual_prompt(base)

        try:
            url = await generate_image(text, size="1792x1024")
            url = persist_generated_image(url)
            self._last_image_url = url
            return url
        except ASI1Error as exc:
            if ctx:
                ctx.logger.error(f"ASI:One image failed: {exc}")
            return None