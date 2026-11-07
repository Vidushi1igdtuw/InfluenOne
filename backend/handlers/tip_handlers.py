"""Tip Jar REST handlers"""
import os
import time
from typing import Dict, Any
from uagents import Context
from rest_models import TipPostRESTRequest, TipPostRESTResponse
from utils.auth import _get_user_id_from_token

def register_tip_handlers(agent, payment_service, supabase_admin):
    """Register tip jar handlers"""
    
    @agent.on_rest_post("/api/posts/tip", TipPostRESTRequest, TipPostRESTResponse)
    async def handle_tip_post(ctx: Context, req: TipPostRESTRequest) -> Dict[str, Any]:
        """Tip a post creator with FET/Stripe"""
        try:
            tipper_id = await _get_user_id_from_token(ctx)
            if not tipper_id:
                return {"success": False, "error": "Authentication required"}
            
            # Get post creator
            post_result = supabase_admin.table("generated_posts").select("user_id").eq("id", req.post_id).execute()
            if not post_result.data:
                return {"success": False, "error": "Post not found"}
            
            creator_id = post_result.data[0].get("user_id")
            if not creator_id:
                return {"success": False, "error": "Post creator not found"}
            
            # Compare user IDs (ensure both are strings for comparison)
            tipper_id_str = str(tipper_id).strip()
            creator_id_str = str(creator_id).strip()
            
            if tipper_id_str == creator_id_str:
                return {"success": False, "error": "Cannot tip your own post"}
            
            creator_address = os.getenv("FET_WALLET_ADDRESS", "")

            # Record tip payment
            tip_payment = await payment_service.record_payment(
                user_id=tipper_id,
                tx_hash=f"tip_{req.post_id}_{int(time.time())}",  # Temporary hash
                service="tip",
                amount=str(req.amount),
                status="pending"
            )
            
            # Return payment request for frontend to process
            return {
                "success": True,
                "message": f"Tip of {req.amount} FET/Stripe initiated",
                "payment_request": {
                    "recipient_address": creator_address,
                    "amount": req.amount,
                    "post_id": req.post_id,
                    "creator_id": creator_id
                }
            }
        except Exception as e:
            import traceback
            return {"success": False, "error": str(e)}

