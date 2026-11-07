"""Payment Protocol seller: Stripe embedded card (Innovation Lab, Nov 2026).

ASI:One renders Checkout from RequestPayment.metadata["stripe"] with
ui_mode="embedded". Stripe only — do not mix FET into accepted_funds.
"""

from __future__ import annotations

import os
from uuid import uuid4

from uagents import Context, Protocol
from uagents_core.contrib.protocols.payment import (
    CancelPayment,
    CommitPayment,
    CompletePayment,
    Funds,
    RejectPayment,
    RequestPayment,
    payment_protocol_spec,
)

from payments.stripe_embedded import (
    amount_cents,
    create_embedded_checkout_session,
    is_stripe_configured,
    verify_checkout_session_paid,
)
from utils.constants import STRIPE_AMOUNT_USD, pack_uses_for

payment_proto = Protocol(spec=payment_protocol_spec, role="seller")

PAYMENT_DEADLINE_SECONDS = max(60, min(24 * 60 * 60, int(os.getenv("CHECKOUT_DEADLINE_SECONDS", "1800"))))


def _amount_str() -> str:
    try:
        return f"{amount_cents() / 100:.2f}"
    except Exception:
        return str(STRIPE_AMOUNT_USD)


def stash_pending(ctx: Context, sender: str, action: str, **fields: str) -> None:
    session_id = str(ctx.session)
    ctx.storage.set(f"pending_action:{sender}:{session_id}", action)
    for key, value in fields.items():
        ctx.storage.set(f"pending_{key}:{sender}:{session_id}", value or "")


def pop_pending(ctx: Context, sender: str) -> dict[str, str]:
    session_id = str(ctx.session)
    action = str(ctx.storage.get(f"pending_action:{sender}:{session_id}") or "")
    pending = {"action": action}
    for key in ("topic", "url", "language"):
        pending[key] = str(ctx.storage.get(f"pending_{key}:{sender}:{session_id}") or "")
    ctx.storage.set(f"pending_action:{sender}:{session_id}", "")
    return pending


async def request_stripe_payment(ctx: Context, sender: str, *, service: str = "linkedin_post") -> None:
    if not is_stripe_configured():
        from protocol import create_text_chat

        await ctx.send(
            sender,
            create_text_chat("Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY."),
        )
        return

    session_id = str(ctx.session)
    amount_str = _amount_str()
    desc = f"Pay ${amount_str} for 1 ASI:One use"
    checkout = create_embedded_checkout_session(
        user_address=sender,
        chat_session_id=session_id,
        description=desc,
        payment_request_id=uuid4().hex,
        service=service,
    )
    if not checkout or checkout.get("error"):
        from protocol import create_text_chat

        await ctx.send(
            sender,
            create_text_chat(f"Could not start card checkout. {checkout.get('error') if checkout else ''}"),
        )
        return

    ctx.storage.set(f"stripe_session:{sender}:{session_id}", checkout.get("checkout_session_id", ""))
    ctx.storage.set(f"stripe_service:{sender}:{session_id}", service)

    ctx.logger.info(
        f"Stripe RequestPayment ui_mode={checkout.get('ui_mode')} "
        f"session={(checkout.get('checkout_session_id') or '')[:20]}…"
    )

    await ctx.send(
        sender,
        RequestPayment(
            accepted_funds=[Funds(currency="USD", amount=amount_str, payment_method="stripe")],
            recipient=str(ctx.agent.address),
            deadline_seconds=PAYMENT_DEADLINE_SECONDS,
            reference=session_id,
            description=desc,
            metadata={"stripe": checkout, "service": service},
        ),
    )


@payment_proto.on_message(CommitPayment)
async def handle_commit(ctx: Context, sender: str, msg: CommitPayment):
    session_id = str(ctx.session)
    tx_id = str(getattr(msg, "transaction_id", "") or "")
    method = str(getattr(getattr(msg, "funds", None), "payment_method", "") or "")
    stored = str(ctx.storage.get(f"stripe_session:{sender}:{session_id}") or "")
    checkout_id = stored or tx_id
    service = str(ctx.storage.get(f"stripe_service:{sender}:{session_id}") or "linkedin_post")

    if method and method != "stripe":
        await ctx.send(sender, RejectPayment(reason="Card payment only (Stripe)."))
        return
    if not checkout_id:
        await ctx.send(sender, RejectPayment(reason="Missing Stripe checkout session."))
        return

    try:
        result = verify_checkout_session_paid(checkout_id)
    except Exception as exc:  # noqa: BLE001
        await ctx.send(
            sender,
            CancelPayment(transaction_id=tx_id or checkout_id, reason=str(exc)[:180]),
        )
        return

    if not result.get("verified"):
        await ctx.send(
            sender,
            CancelPayment(
                transaction_id=tx_id or checkout_id,
                reason=str(result.get("error") or "Finish Stripe checkout, then tap Pay again."),
            ),
        )
        return

    amount = str(result.get("amount") or _amount_str())
    await ctx.send(sender, CompletePayment(transaction_id=tx_id or checkout_id))
    # Mark paid BEFORE any bookkeeping so this session can never be charged again.
    ctx.storage.set(f"paid:{sender}:{session_id}", True)
    ctx.storage.set(f"ever_paid:{sender}", True)  # survives new chat sessions
    try:
        from supabase import create_client

        from payment_service import PaymentService

        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or ""
        client = create_client(url, key) if url and key else None
        svc = PaymentService(client, client)
        recorded = await svc.record_payment(sender, tx_id or checkout_id, amount, service)
        if not recorded.get("success"):
            # The Stripe charge already succeeded — credits must still be granted,
            # otherwise the user gets asked to pay a second time (double-charge bug).
            fallback = await svc.grant_credits(sender, pack_uses_for(sender))
            ctx.logger.error(
                f"record_payment failed ({recorded.get('error')}); credit fallback: {fallback}"
            )
    except Exception as exc:  # noqa: BLE001
        ctx.logger.error(f"record_payment failed: {exc}")

    try:
        from handlers.chat_handlers import fulfill_pending_job

        await fulfill_pending_job(ctx, sender)
    except Exception as exc:  # noqa: BLE001
        ctx.logger.error(f"fulfill after pay failed: {exc}")
        from protocol import create_text_chat

        await ctx.send(
            sender,
            create_text_chat("Payment received. Send the topic or URL again and I will generate (1 use already paid)."),
        )


@payment_proto.on_message(RejectPayment)
async def handle_reject(ctx: Context, sender: str, msg: RejectPayment):
    from protocols.influenone_cards import send_menu

    pop_pending(ctx, sender)
    await send_menu(ctx, sender, "Payment cancelled. Pay with Stripe card when you are ready.")
