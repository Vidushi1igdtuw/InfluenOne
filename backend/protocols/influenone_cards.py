"""Domain card payloads for InfluenOne (ASI:One form / detail / review)."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

from uagents import Context

from protocols.interactive_cards import create_card_chat


KNOWN_ACTIONS = {
    "menu",
    "generate_post",
    "url_to_post",
    "pay",
    "submit_generate",
    "submit_url",
    "approve_post",
    "regenerate",
}



def menu_card() -> dict[str, Any]:
    return {
        "title": "InfluenOne",
        "summary_rows": [
            {"label": "Model", "value": "ASI:One"},
            {"label": "Pay", "value": "$4.99 only after your draft"},
        ],
        "ctas": [
            {
                "label": "Generate post",
                "primary": True,
                "selection": {"action": "generate_post"},
            },
            {
                "label": "URL to post",
                "primary": True,
                "selection": {"action": "url_to_post"},
            },
            {
                "label": "Pay with card",
                "primary": True,
                "selection": {"action": "pay"},
            },
        ],
    }


def generate_form() -> dict[str, Any]:
    return {
        "title": "Generate a LinkedIn post",
        "fields": [
            {
                "name": "topic",
                "kind": "text",
                "label": "Topic",
                "required": True,
                "placeholder": "What I learned shipping with ASI:One",
                "multiline": True,
            },
            {
                "name": "language",
                "kind": "select",
                "label": "Language",
                "required": True,
                "default": "en",
                "options": [
                    {"value": "en", "label": "English"},
                    {"value": "fr", "label": "French"},
                    {"value": "es", "label": "Spanish"},
                    {"value": "de", "label": "German"},
                ],
            },
        ],
        "submit_cta": {
            "label": "Generate",
            "primary": True,
            "selection": {"action": "submit_generate"},
        },
    }


def url_form() -> dict[str, Any]:
    return {
        "title": "URL to LinkedIn post",
        "fields": [
            {
                "name": "url",
                "kind": "text",
                "label": "Article URL",
                "required": True,
                "placeholder": "https://",
            },
            {
                "name": "language",
                "kind": "select",
                "label": "Language",
                "required": True,
                "default": "en",
                "options": [
                    {"value": "en", "label": "English"},
                    {"value": "fr", "label": "French"},
                    {"value": "es", "label": "Spanish"},
                ],
            },
        ],
        "submit_cta": {
            "label": "Convert",
            "primary": True,
            "selection": {"action": "submit_url"},
        },
    }


def post_review(text: str) -> dict[str, Any]:
    preview = (text or "").strip()
    if len(preview) > 280:
        preview = preview[:277] + "..."
    rows = [{"label": "Draft", "value": preview or "(empty)"}]
    return {
        "title": "Review your post",
        "summary_rows": rows,
        "approve_cta": {
            "label": "Looks good",
            "primary": True,
            "selection": {"action": "approve_post"},
        },
        "reject_cta": {
            "label": "Regenerate",
            "primary": True,
            "selection": {"action": "regenerate"},
        },
    }


async def send_card(
    ctx: Context,
    sender: str,
    narration: str,
    *,
    card_kind: str,
    card_payload: dict[str, Any],
    is_terminal: bool = False,
) -> None:
    await ctx.send(
        sender,
        create_card_chat(
            narration,
            card_kind=card_kind,
            card_payload=card_payload,
            is_terminal=is_terminal,
            card_id=uuid4().hex,
        ),
    )


def _with_asi_link(text: str) -> str:
    suffix = f"\n\nOpen me in ASI:One: {ASI_ONE_CHAT_URL}"
    if ASI_ONE_CHAT_URL in text:
        return text
    return text.rstrip() + suffix


async def send_menu(ctx: Context, sender: str, narration: str | None = None) -> None:
    await send_card(
        ctx,
        sender,
        _with_asi_link(
            narration
            or "Chat free — send a topic or paste a URL and I'll write the post + graphic first. You only pay ($4.99 Stripe) after you see the draft, and only when no uses are left."
        ),
        card_kind="detail",
        card_payload=menu_card(),
    )
