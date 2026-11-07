"""Payments: Stripe Checkout (card) and FET on Fetch Network."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Dict, Optional

from supabase import Client

import fet_service
from utils.constants import FET_AMOUNT, STRIPE_AMOUNT_USD

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None


class PaymentService:
    def __init__(self, supabase_client: Optional[Client] = None, supabase_admin: Optional[Client] = None):
        self.supabase_client = supabase_client
        self.supabase_admin = supabase_admin or supabase_client
        self.stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
        if stripe and self.stripe_key:
            stripe.api_key = self.stripe_key

    def stripe_ready(self) -> bool:
        return bool(stripe and self.stripe_key)

    async def check_user_payment_status(self, user_id: str, service: str = None) -> Dict:
        if not self.supabase_admin:
            return {"has_paid": False, "error": "Database not configured"}
        try:
            query = self.supabase_admin.table("payments").select("*").eq("user_id", user_id).eq("status", "verified")
            if service and service != "dashboard_access":
                result = query.in_("service", [service, "dashboard_access"]).order("created_at", desc=True).limit(1).execute()
            else:
                service_to_check = service or "dashboard_access"
                result = query.eq("service", service_to_check).order("created_at", desc=True).limit(1).execute()
            if result.data:
                payment = result.data[0]
                return {
                    "has_paid": True,
                    "payment_date": payment.get("created_at"),
                    "tx_hash": payment.get("tx_hash"),
                    "amount": payment.get("amount"),
                    "service": payment.get("service"),
                }
            return {"has_paid": False}
        except Exception as e:  # noqa: BLE001
            return {"has_paid": False, "error": str(e)}

    async def record_payment(self, user_id: str, tx_hash: str, amount: str, service: str = "dashboard_access") -> Dict:
        if not self.supabase_admin:
            return {"success": False, "error": "Database not configured"}
        try:
            payment_data = {
                "user_id": user_id,
                "tx_hash": tx_hash,
                "service": service,
                "amount": amount,
                "status": "verified",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            result = self.supabase_admin.table("payments").insert(payment_data).execute()
            if result.data:
                return {"success": True, "payment_id": result.data[0].get("id"), "payment": result.data[0]}
            existing = self.supabase_admin.table("payments").select("*").eq("tx_hash", tx_hash).eq("service", service).execute()
            if existing.data:
                return {"success": True, "payment_id": existing.data[0].get("id"), "payment": existing.data[0], "already_exists": True}
            return {"success": False, "error": "Failed to record payment"}
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "23505" in msg or "duplicate" in msg.lower() or "unique" in msg.lower():
                existing = self.supabase_admin.table("payments").select("*").eq("tx_hash", tx_hash).eq("service", service).execute()
                if existing.data:
                    return {"success": True, "payment_id": existing.data[0].get("id"), "already_exists": True}
            if "23503" in msg or "foreign key" in msg.lower():
                return {"success": False, "error": f"User not found: {user_id}. Please login first."}
            return {"success": False, "error": f"Database error: {msg}"}

    async def refund_payment(self, user_id: str, tx_hash: str, service: str, reason: str = "Service failed") -> Dict:
        if not self.supabase_admin:
            return {"success": False, "error": "Database not configured"}
        try:
            payment_result = (
                self.supabase_admin.table("payments")
                .select("*")
                .eq("user_id", user_id)
                .eq("tx_hash", tx_hash)
                .eq("service", service)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if not payment_result.data:
                return {"success": False, "error": "Payment record not found"}
            payment = payment_result.data[0]
            update_result = (
                self.supabase_admin.table("payments")
                .update(
                    {
                        "status": "refund_pending",
                        "refund_reason": reason,
                        "refund_requested_at": datetime.now(timezone.utc).isoformat(),
                    }
                )
                .eq("id", payment.get("id"))
                .execute()
            )
            if update_result.data:
                return {
                    "success": True,
                    "message": "Payment marked for refund.",
                    "payment_id": payment.get("id"),
                    "refund_status": "pending",
                }
            return {"success": False, "error": "Failed to update payment status"}
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}

    async def create_stripe_checkout(self, user_id: str, service: str, success_url: str, cancel_url: str) -> Dict:
        if not self.stripe_ready():
            return {"success": False, "error": "Stripe is not configured (STRIPE_SECRET_KEY)"}
        cents = int(round(float(STRIPE_AMOUNT_USD) * 100))
        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=user_id,
                metadata={"user_id": user_id, "service": service},
                line_items=[
                    {
                        "quantity": 1,
                        "price_data": {
                            "currency": "usd",
                            "unit_amount": cents,
                            "product_data": {"name": f"InfluenOne — {service.replace('_', ' ')}"},
                        },
                    }
                ],
            )
            return {"success": True, "checkout_url": session.url, "session_id": session.id}
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}

    async def verify_stripe_session(self, user_id: str, session_id: str, service: str) -> Dict:
        if not self.stripe_ready():
            return {"success": False, "error": "Stripe is not configured"}
        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": f"Stripe session lookup failed: {e}"}
        if session.payment_status != "paid":
            return {"success": False, "error": f"Stripe session is {session.payment_status}, not paid"}
        meta_user = (session.metadata or {}).get("user_id") or session.client_reference_id
        if meta_user and str(meta_user) != str(user_id):
            return {"success": False, "error": "This checkout session belongs to another account"}
        amount = STRIPE_AMOUNT_USD
        if session.amount_total is not None:
            amount = f"{session.amount_total / 100:.2f}"
        recorded = await self.record_payment(user_id, session.id, amount, service)
        if not recorded.get("success"):
            return recorded
        return {
            "success": True,
            "verified": True,
            "tx_id": session.id,
            "amount": amount,
            "method": "stripe",
        }

    async def verify_and_record_payment(self, user_id: str, tx_id: str, amount: str, service: str = "dashboard_access") -> Dict:
        """Verify a FET transfer, then record it. Stripe uses verify_stripe_session."""
        result = await fet_service.verify_transfer(tx_id)
        if not result.get("success"):
            return result
        actual = result.get("tx_id", tx_id)
        recorded = await self.record_payment(user_id, actual, amount or result.get("amount") or FET_AMOUNT, service)
        if not recorded.get("success"):
            if recorded.get("already_exists"):
                return {"success": True, "verified": True, "tx_id": actual, "already_recorded": True}
            return recorded
        return {
            "success": True,
            "verified": True,
            "tx_id": actual,
            "method": "fet",
            "explorer_url": result.get("explorer_url"),
        }

    def _explorer_for(self, tx_hash: str) -> Optional[str]:
        if not tx_hash:
            return None
        if str(tx_hash).startswith("cs_"):
            return None
        return fet_service.explorer_url(tx_hash)

    async def get_payment_history(self, user_id: str, limit: int = 50, offset: int = 0) -> Dict:
        if not self.supabase_admin:
            return {"success": False, "error": "Database not configured"}
        try:
            count_result = (
                self.supabase_admin.table("payments")
                .select("*", count="exact")
                .eq("user_id", user_id)
                .eq("status", "verified")
                .execute()
            )
            total_count = count_result.count if hasattr(count_result, "count") else 0
            result = (
                self.supabase_admin.table("payments")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "verified")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            payments = result.data or []
            for payment in payments:
                payment["explorer_url"] = self._explorer_for(payment.get("tx_hash"))
            total_spent = sum(float(p.get("amount") or 0) for p in payments)
            return {
                "success": True,
                "payments": payments,
                "total_count": total_count,
                "total_spent": str(total_spent),
                "environment": fet_service.FET_NETWORK,
            }
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}

    async def get_payment_analytics(self, user_id: str) -> Dict:
        if not self.supabase_admin:
            return {"success": False, "error": "Database not configured"}
        try:
            result = (
                self.supabase_admin.table("payments")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "verified")
                .order("created_at", desc=True)
                .execute()
            )
            payments = result.data or []
            total_spent = 0.0
            service_breakdown: dict = {}
            for payment in payments:
                amount = float(payment.get("amount") or 0)
                total_spent += amount
                service = payment.get("service", "unknown")
                if service not in service_breakdown:
                    service_breakdown[service] = {"count": 0, "total_amount": 0.0}
                service_breakdown[service]["count"] += 1
                service_breakdown[service]["total_amount"] += amount
            for service in service_breakdown:
                service_breakdown[service]["total_amount"] = str(service_breakdown[service]["total_amount"])
            return {
                "success": True,
                "total_spent": str(total_spent),
                "total_transactions": len(payments),
                "service_breakdown": service_breakdown,
                "recent_payments": payments[:10],
            }
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}

    async def get_payment_receipt(self, user_id: str, tx_hash: str) -> Dict:
        if not self.supabase_admin:
            return {"success": False, "error": "Database not configured"}
        try:
            result = (
                self.supabase_admin.table("payments")
                .select("*")
                .eq("user_id", user_id)
                .eq("tx_hash", tx_hash)
                .execute()
            )
            if not result.data:
                return {"success": False, "error": "Payment not found"}
            payment = result.data[0]
            receipt = {
                "payment_id": payment.get("id"),
                "tx_hash": payment.get("tx_hash"),
                "service": payment.get("service"),
                "amount": payment.get("amount"),
                "status": payment.get("status"),
                "created_at": payment.get("created_at"),
                "explorer_url": self._explorer_for(tx_hash),
                "environment": fet_service.FET_NETWORK,
            }
            return {"success": True, "receipt": receipt}
        except Exception as e:  # noqa: BLE001
            return {"success": False, "error": str(e)}
