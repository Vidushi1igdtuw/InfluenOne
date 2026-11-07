"""ASI:One chat: interactive cards + Stripe Payment Protocol (1 use / card)."""

from __future__ import annotations

from datetime import datetime
from typing import Callable, Optional

from uagents import Context
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
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
from protocols.interactive_cards import normalize_card_selection

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
        paid: bool,
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
            card_payload=post_review(body, paid=True),
        )

    async def _run_generate(ctx: Context, sender: str, topic: str, language: str) -> None:
        await ctx.send(sender, create_text_chat("Writing your LinkedIn post with ASI:One and a graphic. This can take a minute…"))
        result = await ai_service.generate_linkedin_post_with_image(topic, True, language or "en", ctx)
        if result.get("has_error") or result.get("error"):
            await ctx.send(sender, create_text_chat(result.get("error") or "Generation failed."))
            return
        if payment_service:
            await payment_service.consume_credit(sender, "asi1_generate")
            ctx.storage.set(f"paid:{sender}:{str(ctx.session)}", False)
        await _deliver_post(
            ctx,
            sender,
            result.get("text") or "",
            paid=True,
            topic=topic,
            image_url=str(result.get("image_url") or ""),
        )

    async def _run_url(ctx: Context, sender: str, url: str, language: str) -> None:
        await ctx.send(sender, create_text_chat("Reading the page, searching the live web, and writing a post with a graphic…"))
        result = await ai_service.extract_and_convert_url_to_post(url, True, language or "en", ctx)
        if result.get("error"):
            await ctx.send(sender, create_text_chat(str(result["error"])))
            return
        if payment_service:
            await payment_service.consume_credit(sender, "asi1_url")
            ctx.storage.set(f"paid:{sender}:{str(ctx.session)}", False)
        await _deliver_post(
            ctx,
            sender,
            result.get("text") or "",
            paid=True,
            image_url=str(result.get("image_url") or ""),
        )

    async def _need_pay(ctx: Context, sender: str, paid: bool) -> bool:
        if not payment_service or paid:
            return False
        need = await payment_service.require_credit(sender)
        return bool(need)

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
        await send_menu(ctx, sender, "Payment confirmed. 1 ASI:One use unlocked.")

    _fulfill = fulfill

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

        for item in msg.content:
            if isinstance(item, StartSessionContent):
                await send_menu(ctx, sender)
                return
            if isinstance(item, EndSessionContent):
                return
            if not isinstance(item, TextContent):
                continue

            text = (item.text or "").strip()
            sel = normalize_card_selection(text, KNOWN_ACTIONS)
            action = str(sel.get("action") or "").strip()

            if action in {"menu", "hello", "hi", "start"} or text.lower() in {"hi", "hello", "help", "menu", "start"}:
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

            if action == "submit_generate":
                topic = str(sel.get("topic") or "").strip()
                language = str(sel.get("language") or "en")
                if not topic:
                    await ctx.send(sender, create_text_chat("Need a topic to generate."))
                    return
                if await _need_pay(ctx, sender, paid):
                    stash_pending(ctx, sender, "submit_generate", topic=topic, language=language)
                    await request_stripe_payment(ctx, sender, service="asi1_generate")
                    return
                await _run_generate(ctx, sender, topic, language)
                return

            if action == "submit_url":
                url = str(sel.get("url") or "").strip()
                language = str(sel.get("language") or "en")
                if not url:
                    await ctx.send(sender, create_text_chat("Need a URL."))
                    return
                if await _need_pay(ctx, sender, paid):
                    stash_pending(ctx, sender, "submit_url", url=url, language=language)
                    await request_stripe_payment(ctx, sender, service="asi1_url")
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
                if await _need_pay(ctx, sender, paid):
                    stash_pending(ctx, sender, "submit_generate", topic=topic, language="en")
                    await request_stripe_payment(ctx, sender, service="asi1_generate")
                    return
                await _run_generate(ctx, sender, topic, "en")
                return

            if action == "approve_post":
                await send_menu(ctx, sender, "Draft saved. Open the website to publish to LinkedIn.")
                return

            if text.lower() in {"paid", "done", "payment done"}:
                await request_stripe_payment(ctx, sender)
                return

            looks_url = text.lower().startswith("http://") or text.lower().startswith("https://")
            if await _need_pay(ctx, sender, paid):
                if looks_url:
                    stash_pending(ctx, sender, "submit_url", url=text, language="en")
                    await request_stripe_payment(ctx, sender, service="asi1_url")
                else:
                    stash_pending(ctx, sender, "submit_generate", topic=text, language="en")
                    await request_stripe_payment(ctx, sender, service="asi1_generate")
                return
            if looks_url:
                await _run_url(ctx, sender, text, "en")
                return
            await _run_generate(ctx, sender, text, "en")

    @chat_proto.on_message(ChatAcknowledgement)
    async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
        return

    agent.include(chat_proto, publish_manifest=True)
