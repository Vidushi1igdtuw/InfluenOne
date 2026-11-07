"""Payment Protocol seller: Stripe embedded card checkout (Innovation Lab quiz/nano-banana pattern).

ASI:One renders the native Pay with Stripe card from RequestPayment.
Do not send a text bubble in the same turn — it swallows the payment card.
"""

from __future__ import annotations

import os
from typing import Any
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
from protocols.influenone_cards import send_menu
from utils.constants import FET_AMOUNT, FET_WALLET_ADDRESS, STRIPE_AMOUNT_USD

payment_proto = Protocol(spec=payment_protocol_spec, role="seller")

PAYMENT_DEADLINE_SECONDS = max(60, min(24 * 60 * 60, int(os.getenv("CHECKOUT_DEADLINE_SECONDS", "1800"))))


def _amount_str() -> str:
    try:
        return f"{amount_cents() / 100:.2f}"
    except Exception:
        return str(STRIPE_AMOUNT_USD)


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
    desc = f"Pay ${amount_str} to unlock InfluenOne (generate → post)"
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

    accepted = [Funds(currency="USD", amount=amount_str, payment_method="stripe")]
    metadata: dict[str, Any] = {"stripe": checkout, "service": service, "agent": "InfluenOneAgent"}
    if FET_WALLET_ADDRESS:
        accepted.append(Funds(currency="FET", amount=str(FET_AMOUNT), payment_method="fet"))
        metadata["fet_wallet"] = FET_WALLET_ADDRESS

    await ctx.send(
        sender,
        RequestPayment(
            accepted_funds=accepted,
            recipient=str(ctx.agent.address),
            deadline_seconds=PAYMENT_DEADLINE_SECONDS,
            reference=session_id,
            description=desc,
            metadata=metadata,
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

    verified = False
    amount = _amount_str()
    if method == "stripe" or (checkout_id or "").startswith("cs_"):
        result = verify_checkout_session_paid(checkout_id)
        verified = bool(result.get("verified"))
        amount = str(result.get("amount") or amount)
    elif method in {"fet", "fet_direct"} and tx_id:
        from fet_service import verify_transfer

        result = await verify_transfer(tx_id)
        verified = bool(result.get("success"))
        amount = str(result.get("amount") or FET_AMOUNT)

    if not verified:
        await ctx.send(
            sender,
            CancelPayment(
                transaction_id=tx_id or checkout_id or None,
                reason="Payment not confirmed yet. Finish Stripe checkout or send a FET tx hash.",
            ),
        )
        return

    await ctx.send(
        sender,
        CompletePayment(transaction_id=tx_id or checkout_id),
    )
    ctx.storage.set(f"paid:{sender}:{session_id}", True)
    try:
        from payment_service import PaymentService

        svc = PaymentService()
        await svc.record_payment(sender, tx_id or checkout_id, amount, service)
    except Exception:
        pass
    await send_menu(ctx, sender, "Payment confirmed. Generate a post when you are ready.")


@payment_proto.on_message(RejectPayment)
async def handle_reject(ctx: Context, sender: str, msg: RejectPayment):
    await send_menu(ctx, sender, "Payment cancelled. You can pay with card whenever you are ready.")
