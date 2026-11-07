"""ASI:One chat: interactive cards + Stripe Payment Protocol.

Flow: free chat → topic/URL card → generate post FIRST → LinkedIn connect →
payment LAST (only when the user has no remaining uses and has not just paid).
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime
from typing import Callable, Optional

from uagents import Context
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    ResourceContent,
    StartSessionContent,
    TextContent,
)

from protocol import create_text_chat
from protocols.payment_proto import pop_pending, request_stripe_payment, stash_pending
from protocols.influenone_cards import (
    KNOWN_ACTIONS,
    generate_form,
    post_review,
    send_card,
    send_menu,
    url_form,
)
from protocols.interactive_cards import normalize_card_selection, strip_mention_prefix
from services.ai.asi1 import ASI1Error
from services.ai.asi1 import chat as asi1_chat

NATURAL_CHAT_SYSTEM = (
    "You are InfluenOne, a LinkedIn content-automation agent on ASI:One. "
    "Reply naturally, warmly and concisely in the user's own language (English, Hindi or Hinglish). "
    "You help creators turn a topic or an article URL into a LinkedIn post with a graphic. "
    "Flow: chat freely first — when the user wants a post, invite them to tap the Generate post / "
    "URL to post buttons (or paste a URL). The post is generated FIRST; payment ($4.99, Stripe) "
    "is only requested AFTER the draft is delivered, and only when no uses remain. Never demand "
    "payment before a draft exists. Never write the full post in chat. "
    "Small talk, feature questions, pricing and help are free."
)

GREETINGS = {
    "hi", "hii", "hiii", "hey", "heyy", "hello", "helo",
    "namaste", "namaskar", "help", "menu", "start",
}

_CREATE_VERBS = r"(?:write|create|make|generate|draft|compose|banao|likho|bana)"
GENERATE_INTENT_RE = re.compile(
    rf"\bpost\b.{{0,60}}?\b{_CREATE_VERBS}\b"
    rf"|\b{_CREATE_VERBS}\b.{{0,60}}?\bpost\b"
    rf"|\b(?:bana|likh)\b.{{0,40}}?\bpost\b",
    re.IGNORECASE,
)

_fulfill: Optional[Callable] = None


async def fulfill_pending_job(ctx: Context, sender: str) -> None:
    if _fulfill is None:
        await send_menu(ctx, sender, "Payment confirmed. 1 use unlocked — generate a post.")
        return
    await _fulfill(ctx, sender)


def register_chat_protocol(agent, chat_proto, ai_service, payment_service=None):
    global _fulfill

    async def _deliver_post(
        ctx: Context,
        sender: str,
        body: str,
        *,
        topic: str = "",
        image_url: str = "",
    ) -> None:
        session_id = str(ctx.session)
        if topic:
            ctx.storage.set(f"topic:{sender}:{session_id}", topic)
        ctx.storage.set(f"draft:{sender}:{session_id}", body)
        narration = body
        if image_url.startswith("http"):
            narration = f"{body}\n\n![LinkedIn graphic]({image_url})"
        await send_card(
            ctx,
            sender,
            narration,
            card_kind="review",
            card_payload=post_review(body),
        )

    async def _after_post(ctx: Context, sender: str) -> None:
        """Post-delivery steps: LinkedIn connect guidance, then payment LAST —
        and only when the user has no uses left and has not just paid."""
        frontend = os.getenv("FRONTEND_URL", "https://frontend-production-2e733.up.railway.app").rstrip("/")
        await ctx.send(
            sender,
            create_text_chat(
                f"Next step: connect your LinkedIn account on the website to publish — {frontend}/dashboard"
            ),
        )
        if not payment_service:
            return
        session_id = str(ctx.session)
        if bool(ctx.storage.get(f"paid:{sender}:{session_id}")):
            return  # just paid this session — never charge twice
        need = await payment_service.require_credit(sender)
        if need:
            await ctx.send(
                sender,
                create_text_chat("You have no uses left. Pay once with the card below to keep generating."),
            )
            await request_stripe_payment(ctx, sender)

    async def _run_generate(ctx: Context, sender: str, topic: str, language: str) -> None:
        await ctx.send(sender, create_text_chat("Writing your LinkedIn post with ASI:One and a graphic. This can take a minute…"))
        result = await ai_service.generate_linkedin_post_with_image(topic, True, language or "en", ctx)
        if result.get("has_error") or result.get("error"):
            await ctx.send(sender, create_text_chat(result.get("error") or "Generation failed."))
            return
        # Generate FIRST. Consume a use best-effort (dashboard payment = main payment);
        # never block the draft on payment.
        if payment_service:
            try:
                await payment_service.consume_credit(sender, "asi1_generate")
            except Exception:
                pass
        await _deliver_post(
            ctx,
            sender,
            result.get("text") or "",
            topic=topic,
            image_url=str(result.get("image_url") or ""),
        )
        await _after_post(ctx, sender)

    async def _run_url(ctx: Context, sender: str, url: str, language: str) -> None:
        await ctx.send(sender, create_text_chat("Reading the page, searching the live web, and writing a post with a graphic…"))
        result = await ai_service.extract_and_convert_url_to_post(url, True, language or "en", ctx)
        if result.get("error"):
            await ctx.send(sender, create_text_chat(str(result["error"])))
            return
        if payment_service:
            try:
                await payment_service.consume_credit(sender, "asi1_url")
            except Exception:
                pass
        await _deliver_post(
            ctx,
            sender,
            result.get("text") or "",
            image_url=str(result.get("image_url") or ""),
        )
        await _after_post(ctx, sender)

    async def fulfill(ctx: Context, sender: str) -> None:
        pending = pop_pending(ctx, sender)
        action = pending.get("action") or ""
        language = pending.get("language") or "en"
        if action == "submit_generate" and pending.get("topic"):
            await _run_generate(ctx, sender, pending["topic"], language)
            return
        if action == "submit_url" and pending.get("url"):
            await _run_url(ctx, sender, pending["url"], language)
            return
        await send_menu(ctx, sender, "Payment confirmed — you're covered. Send a topic or URL and I'll write the post.")

    _fulfill = fulfill

    async def _natural_chat(ctx: Context, sender: str, text: str) -> None:
        """Free-form conversation with ASI:One. No payment involved."""
        session_id = str(ctx.session)
        history_key = f"chat_history:{sender}:{session_id}"
        try:
            history = json.loads(ctx.storage.get(history_key) or "[]")
        except Exception:
            history = []
        if not isinstance(history, list):
            history = []
        messages: list[dict[str, str]] = [{"role": "system", "content": NATURAL_CHAT_SYSTEM}]
        messages.extend(turn for turn in history[-6:] if isinstance(turn, dict))
        messages.append({"role": "user", "content": text})
        try:
            reply = await asi1_chat(messages, temperature=0.7, max_tokens=600)
        except ASI1Error:
            await ctx.send(sender, create_text_chat("ASI:One is busy right now. Please try again in a moment."))
            return
        except Exception:
            await ctx.send(sender, create_text_chat("Something went wrong. Please try again."))
            return
        history = (history + [
            {"role": "user", "content": text},
            {"role": "assistant", "content": reply},
        ])[-10:]
        ctx.storage.set(history_key, json.dumps(history))
        await ctx.send(sender, create_text_chat(reply))

    @chat_proto.on_message(ChatMessage)
    async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
        msg_key = f"{sender}:{msg.msg_id}"
        processed = getattr(ctx, "_processed_messages", None)
        if processed is None:
            ctx._processed_messages = {msg_key}
        elif msg_key in processed:
            return
        else:
            processed.add(msg_key)

        ctx.storage.set(str(ctx.session), sender)
        await ctx.send(
            sender,
            ChatAcknowledgement(timestamp=datetime.utcnow(), acknowledged_msg_id=msg.msg_id),
        )

        session_id = str(ctx.session)
        paid = bool(ctx.storage.get(f"paid:{sender}:{session_id}"))
        if payment_service and not paid:
            try:
                status = await payment_service.check_user_payment_status(sender)
                paid = bool(status.get("has_paid"))
                if paid:
                    ctx.storage.set(f"paid:{sender}:{session_id}", True)
            except Exception:
                pass

        # ASI:One often sends StartSessionContent + TextContent in ONE message.
        # Never return early on StartSession — capture the first text instead
        # (same flow as the veo3-agent reference). Only a PURE session-open
        # (StartSession with no text and no resource) gets the menu card.
        text_content = None
        had_start_session = False
        has_resource = False
        for item in msg.content:
            if isinstance(item, StartSessionContent):
                had_start_session = True
                continue
            if isinstance(item, EndSessionContent):
                return
            if isinstance(item, ResourceContent):
                has_resource = True
                continue
            if isinstance(item, TextContent) and text_content is None:
                text_content = item

        if had_start_session and text_content is None and not has_resource:
            await send_menu(ctx, sender)
            return

        if text_content is None:
            return

        text = (text_content.text or "").strip()
        if not text:
            if had_start_session:
                await send_menu(ctx, sender)
            return

        sel = normalize_card_selection(text, KNOWN_ACTIONS)
        action = str(sel.get("action") or "").strip()

        plain = strip_mention_prefix(text).lower().rstrip("!.,? ")
        if action in {"menu", "hello", "hi", "start"} or plain in GREETINGS:
            await send_menu(ctx, sender)
            return

        if action == "generate_post":
            await send_card(
                ctx,
                sender,
                "Tell me the topic. ASI:One writes the post.",
                card_kind="form",
                card_payload=generate_form(),
            )
            return

        if action == "url_to_post":
            await send_card(
                ctx,
                sender,
                "Paste an article URL. ASI:One turns it into a LinkedIn post.",
                card_kind="form",
                card_payload=url_form(),
            )
            return

        if action == "pay":
            stash_pending(ctx, sender, "pay")
            await request_stripe_payment(ctx, sender)
            return

        # Generate FIRST — payment is settled after the draft is delivered.
        if action == "submit_generate":
            topic = str(sel.get("topic") or "").strip()
            language = str(sel.get("language") or "en")
            if not topic:
                await ctx.send(sender, create_text_chat("Need a topic to generate."))
                return
            await _run_generate(ctx, sender, topic, language)
            return

        if action == "submit_url":
            url = str(sel.get("url") or "").strip()
            language = str(sel.get("language") or "en")
            if not url:
                await ctx.send(sender, create_text_chat("Need a URL."))
                return
            await _run_url(ctx, sender, url, language)
            return

        if action == "regenerate":
            topic = str(ctx.storage.get(f"topic:{sender}:{session_id}") or "")
            if not topic:
                await send_card(
                    ctx,
                    sender,
                    "Pick a new topic.",
                    card_kind="form",
                    card_payload=generate_form(),
                )
                return
            await _run_generate(ctx, sender, topic, "en")
            return

        if action == "approve_post":
            await send_menu(
                ctx,
                sender,
                "Draft saved. Connect LinkedIn on the website to publish, or ask me for another post.",
            )
            return

        if text.lower() in {"paid", "payment done"}:
            await request_stripe_payment(ctx, sender)
            return

        looks_url = text.lower().startswith("http://") or text.lower().startswith("https://")
        # URL → URL-to-post flow. Generate first; payment comes after delivery.
        if looks_url:
            await _run_url(ctx, sender, text, "en")
            return
        # Explicit "write a post about X" intent → open the generate form (free).
        if GENERATE_INTENT_RE.search(text):
            await send_card(
                ctx,
                sender,
                "Great topic! Confirm or edit it in the form — ASI:One writes the post first; you only pay after you see it.",
                card_kind="form",
                card_payload=generate_form(),
            )
            return
        # Plain text → natural conversation. Free — no payment gate.
        await _natural_chat(ctx, sender, text)

    @chat_proto.on_message(ChatAcknowledgement)
    async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
        return

    agent.include(chat_proto, publish_manifest=True)