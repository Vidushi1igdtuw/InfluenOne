"""App constants. Website pay is Stripe packs. ASI:One chat is 1 use per pay."""

import os

STRIPE_AMOUNT_USD = os.getenv("STRIPE_AMOUNT_USD", "4.99")
FET_AMOUNT = os.getenv("FET_AMOUNT", "5")
FET_WALLET_ADDRESS = os.getenv("FET_WALLET_ADDRESS", "")
FET_NETWORK = os.getenv("FET_NETWORK", "testnet")

WEB_PACK_USES = int(os.getenv("WEB_PACK_USES", "10"))
ASI_ONE_USES = int(os.getenv("ASI_ONE_USES", "1"))


def pack_uses_for(user_id: str) -> int:
    uid = str(user_id or "")
    if uid.startswith("agent1"):
        return ASI_ONE_USES
    return WEB_PACK_USES
