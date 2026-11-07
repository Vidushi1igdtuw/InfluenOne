"""ASI:One chat: interactive cards + Stripe Payment Protocol."""

from __future__ import annotations

from datetime import datetime

from uagents import Context
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
)

from protocol import create_text_chat
from protocols.payment_proto import request_stripe_payment
from protocols.influenone_cards import (
    KNOWN_ACTIONS,
    generate_form,
    post_review,
    send_card,
    send_menu,
    url_form,
)
from protocols.interactive_cards import normalize_card_selection


def register_chat_protocol(agent, chat_proto, ai_service, payment_service=None):
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
                    "Tell me the topic. ASI-1 writes the post.",
                    card_kind="form",
                    card_payload=generate_form(),
                )
                return

            if action == "url_to_post":
                await send_card(
                    ctx,
                    sender,
                    "Paste an article URL. ASI-1 turns it into a LinkedIn post.",
                    card_kind="form",
                    card_payload=url_form(),
                )
                return

            if action == "pay":
                # Native ASI:One Stripe card — no extra text in this turn.
                await request_stripe_payment(ctx, sender)
                return

            if action == "submit_generate":
                topic = str(sel.get("topic") or "").strip()
                language = str(sel.get("language") or "en")
                if not topic:
                    await ctx.send(sender, create_text_chat("Need a topic to generate."))
                    return
                ctx.storage.set(f"topic:{sender}:{session_id}", topic)
                result = await ai_service.generate_linkedin_post(topic, True, language)
                if result.get("has_error") or result.get("error"):
                    await ctx.send(sender, create_text_chat(result.get("error") or "Generation failed."))
                    return
                body = result.get("text") or ""
                ctx.storage.set(f"draft:{sender}:{session_id}", body)
                await send_card(
                    ctx,
                    sender,
                    body,
                    card_kind="review",
                    card_payload=post_review(body, paid=paid),
                )
                return

            if action == "submit_url":
                url = str(sel.get("url") or "").strip()
                language = str(sel.get("language") or "en")
                if not url:
                    await ctx.send(sender, create_text_chat("Need a URL."))
                    return
                result = await ai_service.extract_and_convert_url_to_post(url, False, language, ctx)
                if result.get("error"):
                    await ctx.send(sender, create_text_chat(str(result["error"])))
                    return
                body = result.get("text") or ""
                ctx.storage.set(f"draft:{sender}:{session_id}", body)
                await send_card(
                    ctx,
                    sender,
                    body,
                    card_kind="review",
                    card_payload=post_review(body, paid=paid),
                )
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
                result = await ai_service.generate_linkedin_post(topic, True, "en")
                body = result.get("text") or ""
                ctx.storage.set(f"draft:{sender}:{session_id}", body)
                await send_card(
                    ctx,
                    sender,
                    body,
                    card_kind="review",
                    card_payload=post_review(body, paid=paid),
                )
                return

            if action == "approve_post":
                await send_menu(ctx, sender, "Draft saved. Pay with card if you have not already, then post from the app.")
                return

            if text.lower() in {"paid", "done", "payment done"}:
                await request_stripe_payment(ctx, sender)
                return

            # Free-text topic → generate
            result = await ai_service.generate_linkedin_post(text, True, "en")
            if result.get("has_error") or result.get("error"):
                await ctx.send(sender, create_text_chat(result.get("error") or "Generation failed."))
                return
            body = result.get("text") or ""
            ctx.storage.set(f"topic:{sender}:{session_id}", text)
            ctx.storage.set(f"draft:{sender}:{session_id}", body)
            await send_card(
                ctx,
                sender,
                body,
                card_kind="review",
                card_payload=post_review(body, paid=paid),
            )

    @chat_proto.on_message(ChatAcknowledgement)
    async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
        return

    agent.include(chat_proto, publish_manifest=True)
