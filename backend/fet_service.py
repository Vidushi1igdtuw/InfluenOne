"""Verify FET transfers on Fetch Network (testnet or mainnet)."""

from __future__ import annotations

import os
from typing import Any

import aiohttp
from dotenv import load_dotenv

load_dotenv()

FET_NETWORK = os.getenv("FET_NETWORK", "testnet").lower()
FET_LCD = os.getenv(
    "FET_LCD_URL",
    "https://rest-dorado.fetch.ai" if FET_NETWORK != "mainnet" else "https://rest-fetchhub.fetch.ai",
).rstrip("/")
FET_WALLET = os.getenv("FET_WALLET_ADDRESS", "")
FET_DENOM = os.getenv("FET_DENOM", "atestfet" if FET_NETWORK != "mainnet" else "afet")
FET_AMOUNT = os.getenv("FET_AMOUNT", "5")  # human FET, not atto
FET_EXPLORER = (
    "https://explore-dorado.fetch.ai/transactions"
    if FET_NETWORK != "mainnet"
    else "https://www.mintscan.io/fetch/tx"
)

ATTO = 10**18


def required_atto() -> int:
    return int(float(FET_AMOUNT) * ATTO)


def explorer_url(tx_hash: str) -> str:
    if FET_NETWORK != "mainnet":
        return f"{FET_EXPLORER}/{tx_hash}"
    return f"{FET_EXPLORER}/{tx_hash}"


def config() -> dict[str, str]:
    return {
        "network": FET_NETWORK,
        "address": FET_WALLET,
        "denom": FET_DENOM,
        "amount": FET_AMOUNT,
        "lcd": FET_LCD,
        "explorer_base": FET_EXPLORER,
    }


async def verify_transfer(tx_hash: str, *, min_atto: int | None = None) -> dict[str, Any]:
    """Confirm a MsgSend (or bank send) landed on FET_WALLET with enough FET."""
    if not FET_WALLET:
        return {"success": False, "error": "FET_WALLET_ADDRESS is not set"}
    tx_hash = (tx_hash or "").strip()
    if len(tx_hash) < 16:
        return {"success": False, "error": "Invalid FET transaction hash"}

    url = f"{FET_LCD}/cosmos/tx/v1beta1/txs/{tx_hash}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
                if resp.status == 404:
                    return {"success": False, "error": "Transaction not found on Fetch network"}
                if resp.status != 200:
                    body = await resp.text()
                    return {"success": False, "error": f"LCD error {resp.status}: {body[:300]}"}
                data = await resp.json()
    except Exception as exc:  # noqa: BLE001
        return {"success": False, "error": f"Could not reach Fetch LCD: {exc}"}

    tx_resp = data.get("tx_response") or {}
    if str(tx_resp.get("code", 1)) not in ("0", "0.0"):
        return {"success": False, "error": f"On-chain tx failed (code {tx_resp.get('code')})"}

    received = _amount_to_wallet(data, FET_WALLET, FET_DENOM)
    need = min_atto if min_atto is not None else required_atto()
    if received < need:
        return {
            "success": False,
            "error": f"Received {received} {FET_DENOM}, need at least {need}",
        }
    return {
        "success": True,
        "verified": True,
        "tx_id": tx_hash,
        "amount": str(received / ATTO),
        "denom": FET_DENOM,
        "explorer_url": explorer_url(tx_hash),
    }


def _amount_to_wallet(data: dict[str, Any], wallet: str, denom: str) -> int:
    total = 0
    tx = data.get("tx") or {}
    body = tx.get("body") or {}
    for msg in body.get("messages") or []:
        msg_type = msg.get("@type", "")
        if "MsgSend" in msg_type or msg_type.endswith("bank.v1beta1.MsgSend"):
            if msg.get("to_address") != wallet:
                continue
            for coin in msg.get("amount") or []:
                if coin.get("denom") == denom:
                    total += int(coin.get("amount") or 0)
    if total:
        return total
    # fallback: parse events
    for event in (data.get("tx_response") or {}).get("events") or []:
        if event.get("type") != "transfer":
            continue
        attrs = {a.get("key"): a.get("value") for a in event.get("attributes") or []}
        if attrs.get("recipient") != wallet:
            continue
        amount = attrs.get("amount") or ""
        if amount.endswith(denom):
            total += int(amount[: -len(denom)] or 0)
    return total
