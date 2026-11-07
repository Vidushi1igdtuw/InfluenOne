"""Stripe + FET payment REST handlers."""

from typing import Any, Dict

from uagents import Context

import fet_service
from rest_models import (
    DashboardAccessRESTResponse,
    PaymentAnalyticsRESTResponse,
    PaymentConfigRESTResponse,
    PaymentHistoryRESTResponse,
    PaymentReceiptRESTRequest,
    PaymentReceiptRESTResponse,
    PaymentStatusRESTResponse,
    StripeCheckoutRESTRequest,
    StripeCheckoutRESTResponse,
    StripeVerifyRESTRequest,
    VerifyPaymentRESTRequest,
    VerifyPaymentRESTResponse,
)
from utils.auth import get_user_id_from_token
from utils.constants import FET_AMOUNT, STRIPE_AMOUNT_USD


def register_payment_handlers(agent, payment_service):
    @agent.on_rest_get("/api/payment/config", PaymentConfigRESTResponse)
    async def handle_payment_config(ctx: Context) -> PaymentConfigRESTResponse:
        cfg = fet_service.config()
        return PaymentConfigRESTResponse(
            success=True,
            stripe_amount_usd=STRIPE_AMOUNT_USD,
            stripe_ready=payment_service.stripe_ready(),
            fet_amount=cfg["amount"],
            fet_address=cfg["address"],
            fet_network=cfg["network"],
            fet_denom=cfg["denom"],
        )

    @agent.on_rest_post("/api/payment/stripe/checkout", StripeCheckoutRESTRequest, StripeCheckoutRESTResponse)
    async def handle_stripe_checkout(ctx: Context, req: StripeCheckoutRESTRequest) -> StripeCheckoutRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return StripeCheckoutRESTResponse(success=False, error="Authentication required")
        frontend = __import__("os").getenv("FRONTEND_URL", "http://localhost:5500")
        success_url = req.success_url or f"{frontend}/dashboard?stripe_session={{CHECKOUT_SESSION_ID}}&service={req.service}"
        cancel_url = req.cancel_url or f"{frontend}/dashboard"
        result = await payment_service.create_stripe_checkout(user_id, req.service, success_url, cancel_url)
        if result.get("success"):
            return StripeCheckoutRESTResponse(
                success=True,
                checkout_url=result.get("checkout_url"),
                session_id=result.get("session_id"),
            )
        return StripeCheckoutRESTResponse(success=False, error=result.get("error", "Checkout failed"))

    @agent.on_rest_post("/api/payment/stripe/verify", StripeVerifyRESTRequest, VerifyPaymentRESTResponse)
    async def handle_stripe_verify(ctx: Context, req: StripeVerifyRESTRequest) -> VerifyPaymentRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return VerifyPaymentRESTResponse(success=False, error="Authentication required")
        result = await payment_service.verify_stripe_session(user_id, req.session_id, req.service)
        if result.get("success"):
            return VerifyPaymentRESTResponse(
                success=True,
                message="Card payment verified",
                tx_hash=result.get("tx_id"),
            )
        return VerifyPaymentRESTResponse(success=False, error=result.get("error", "Stripe verification failed"))

    @agent.on_rest_post("/api/payment/verify", VerifyPaymentRESTRequest, VerifyPaymentRESTResponse)
    async def handle_verify_payment(ctx: Context, req: VerifyPaymentRESTRequest) -> VerifyPaymentRESTResponse:
        user_id = await get_user_id_from_token() or req.user_id
        if not user_id:
            return VerifyPaymentRESTResponse(success=False, error="Authentication required")
        if not req.txHash:
            return VerifyPaymentRESTResponse(success=False, error="Transaction hash required")
        result = await payment_service.verify_and_record_payment(user_id, req.txHash, req.amount, req.service)
        if result.get("success"):
            return VerifyPaymentRESTResponse(
                success=True,
                message="FET payment verified",
                tx_hash=result.get("tx_id"),
                explorer_url=result.get("explorer_url"),
            )
        return VerifyPaymentRESTResponse(success=False, error=result.get("error", "Payment verification failed"))

    @agent.on_rest_get("/api/payment/status", PaymentStatusRESTResponse)
    async def handle_payment_status(ctx: Context) -> PaymentStatusRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return PaymentStatusRESTResponse(has_paid=False, error="Authentication required")
        result = await payment_service.check_user_payment_status(user_id)
        return PaymentStatusRESTResponse(
            has_paid=result.get("has_paid", False),
            payment_date=result.get("payment_date"),
            tx_hash=result.get("tx_hash"),
            amount=result.get("amount"),
            error=result.get("error"),
        )

    @agent.on_rest_get("/api/dashboard/access", DashboardAccessRESTResponse)
    async def handle_dashboard_access(ctx: Context) -> DashboardAccessRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return DashboardAccessRESTResponse(has_access=False, has_paid=False, error="Authentication required")
        result = await payment_service.check_user_payment_status(user_id)
        has_paid = result.get("has_paid", False)
        return DashboardAccessRESTResponse(
            has_access=has_paid,
            has_paid=has_paid,
            message="Access granted" if has_paid else "Payment required",
        )

    @agent.on_rest_get("/api/payment/history", PaymentHistoryRESTResponse)
    async def handle_payment_history(ctx: Context) -> PaymentHistoryRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return PaymentHistoryRESTResponse(success=False, error="Authentication required")
        from utils.auth import _request_query_params

        query_params = _request_query_params.get({})
        limit = int(query_params.get("limit", "50"))
        offset = int(query_params.get("offset", "0"))
        result = await payment_service.get_payment_history(user_id, limit=limit, offset=offset)
        if result.get("success"):
            return PaymentHistoryRESTResponse(
                success=True,
                payments=result.get("payments", []),
                total_count=result.get("total_count", 0),
                total_spent=result.get("total_spent", "0"),
            )
        return PaymentHistoryRESTResponse(success=False, error=result.get("error", "Failed to get payment history"))

    @agent.on_rest_get("/api/payment/analytics", PaymentAnalyticsRESTResponse)
    async def handle_payment_analytics(ctx: Context) -> PaymentAnalyticsRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return PaymentAnalyticsRESTResponse(success=False, error="Authentication required")
        result = await payment_service.get_payment_analytics(user_id)
        if result.get("success"):
            return PaymentAnalyticsRESTResponse(
                success=True,
                total_spent=result.get("total_spent", "0"),
                total_transactions=result.get("total_transactions", 0),
                service_breakdown=result.get("service_breakdown", {}),
                recent_payments=result.get("recent_payments", []),
            )
        return PaymentAnalyticsRESTResponse(success=False, error=result.get("error", "Failed"))

    @agent.on_rest_post("/api/payment/receipt", PaymentReceiptRESTRequest, PaymentReceiptRESTResponse)
    async def handle_payment_receipt(ctx: Context, req: PaymentReceiptRESTRequest) -> PaymentReceiptRESTResponse:
        user_id = await get_user_id_from_token()
        if not user_id:
            return PaymentReceiptRESTResponse(success=False, error="Authentication required")
        result = await payment_service.get_payment_receipt(user_id, req.tx_hash)
        if result.get("success"):
            return PaymentReceiptRESTResponse(success=True, receipt=result.get("receipt"))
        return PaymentReceiptRESTResponse(success=False, error=result.get("error", "Failed"))
