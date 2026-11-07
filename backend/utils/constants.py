"""App constants. Payments are Stripe (card) and FET on Fetch Network."""

import os

STRIPE_AMOUNT_USD = os.getenv("STRIPE_AMOUNT_USD", "4.99")
FET_AMOUNT = os.getenv("FET_AMOUNT", "5")
FET_WALLET_ADDRESS = os.getenv("FET_WALLET_ADDRESS", "")
FET_NETWORK = os.getenv("FET_NETWORK", "testnet")
