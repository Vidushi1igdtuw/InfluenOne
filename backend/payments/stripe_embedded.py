"""Stripe embedded Checkout for ASI:One Payment Protocol (Innovation Lab pattern).

RequestPayment.metadata["stripe"] must be string-valued:
client_secret, checkout_session_id, publishable_key, amount_cents, ui_mode.
Buyer CommitPayment.transaction_id == checkout_session_id.
"""

from __future__ import annotations

import os
import time
from typing import Any
from uuid import uuid4

from utils.constants import STRIPE_AMOUNT_USD


def _stripe_sdk():
    try:
        import stripe  # type: ignore

        return stripe
    except Exception:
        return None


def is_stripe_configured() -> bool:
    stripe = _stripe_sdk()
    if stripe is None:
        return False
    return bool(os.getenv("STRIPE_SECRET_KEY") and os.getenv("STRIPE_PUBLISHABLE_KEY"))


def amount_cents() -> int:
    try:
        return int(round(float(os.getenv("STRIPE_AMOUNT_CENTS") or STRIPE_AMOUNT_USD or "4.99") * 100))
    except Exception:
        return 499


def create_embedded_checkout_session(
    *,
    user_address: str,
    chat_session_id: str,
    description: str,
    payment_request_id: str | None = None,
    service: str = "linkedin_post",
) -> dict[str, Any]:
    stripe = _stripe_sdk()
    secret = os.getenv("STRIPE_SECRET_KEY", "")
    publishable = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    if stripe is None or not secret or not publishable:
        return {"error": "Stripe is not configured (STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY)"}

    stripe.api_key = secret
    cents = amount_cents()
    currency = (os.getenv("STRIPE_CURRENCY") or "usd").strip().lower()
    success_url = os.getenv("STRIPE_SUCCESS_URL", "https://agentverse.ai/payment-success")
    expires_in = max(1800, min(24 * 60 * 60, int(os.getenv("STRIPE_CHECKOUT_EXPIRES_SECONDS") or "1800")))
    expires_at = int(time.time()) + expires_in
    payment_reference = f"{user_address}:{chat_session_id}:{uuid4().hex[:8]}"
    return_url = (
        f"{success_url}?session_id={{CHECKOUT_SESSION_ID}}"
        f"&chat_session_id={chat_session_id}&user={user_address}"
    )
    if payment_request_id:
        return_url += f"&payment_request_id={payment_request_id}"

    txn_description = f"InfluenOneAgent {service} - {description}".strip()
    idem = f"{user_address}:{chat_session_id}:{payment_request_id or ''}:{service}"[:255]

    try:
        session = stripe.checkout.Session.create(
            idempotency_key=idem,
            ui_mode="embedded_page",
            redirect_on_completion="if_required",
            payment_method_types=["card"],
            mode="payment",
            return_url=return_url,
            expires_at=expires_at,
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": "InfluenOne LinkedIn post",
                            "description": txn_description,
                        },
                        "unit_amount": cents,
                    },
                    "quantity": 1,
                }
            ],
            payment_intent_data={
                "description": txn_description,
                "metadata": {
                    "agent": "InfluenOneAgent",
                    "service": service,
                    "payment_reference": payment_reference,
                },
            },
            metadata={
                "user_address": user_address,
                "session_id": chat_session_id,
                "payment_reference": payment_reference,
                "agent": "InfluenOneAgent",
                "service": service,
            },
        )
        return {
            "client_secret": str(session.client_secret or ""),
            "checkout_session_id": str(session.id or ""),
            "publishable_key": str(publishable),
            "currency": currency,
            "amount_cents": str(cents),
            "ui_mode": "embedded_page",
        }
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


def verify_checkout_session_paid(checkout_session_id: str) -> dict[str, Any]:
    stripe = _stripe_sdk()
    secret = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe is None or not secret:
        return {"verified": False, "error": "Stripe is not configured"}
    stripe.api_key = secret
    try:
        session = stripe.checkout.Session.retrieve(checkout_session_id)
        paid = getattr(session, "payment_status", None) == "paid"
        amount_total = getattr(session, "amount_total", None)
        return {
            "verified": bool(paid),
            "checkout_session_id": checkout_session_id,
            "status": getattr(session, "payment_status", None),
            "amount": f"{(amount_total or 0) / 100:.2f}" if amount_total is not None else STRIPE_AMOUNT_USD,
            "metadata": dict(getattr(session, "metadata", None) or {}),
        }
    except Exception as exc:  # noqa: BLE001
        return {"verified": False, "error": str(exc)}
