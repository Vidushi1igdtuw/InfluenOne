"""ASI:One interactive-card transport (Innovation Lab canonical envelope).

Cards ride in ChatMessage MetadataContent. Every metadata value is a string.
Always send TextContent narration as the plain-text fallback.
"""

from __future__ import annotations

import copy
import json
import re
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    MetadataContent,
    TextContent,
)

CARD_PROTOCOL_VERSION = "1"
CARD_PAYLOAD_MAX_BYTES = 60_000

_MENTION_PREFIX_RE = re.compile(r"^(?:@\S+\s+)+")

# Button-label phrases ASI:One may send back as plain text instead of JSON.
LABEL_ALIASES = {
    "looks good": "approve_post",
    "approve": "approve_post",
    "reject": "regenerate",
}


def strip_mention_prefix(text: str) -> str:
    return _MENTION_PREFIX_RE.sub("", (text or "").strip()).strip()


def card_payload_within_limit(card_payload: dict[str, Any]) -> bool:
    try:
        return len(json.dumps(card_payload, ensure_ascii=False).encode("utf-8")) <= CARD_PAYLOAD_MAX_BYTES
    except Exception:
        return False


def stamp_card_id(node: Any, card_id: str) -> None:
    if isinstance(node, dict):
        if isinstance(node.get("action"), str):
            node["card_id"] = card_id
        for value in node.values():
            stamp_card_id(value, card_id)
    elif isinstance(node, list):
        for item in node:
            stamp_card_id(item, card_id)


def card_payload_actions(card_payload: dict[str, Any]) -> list[str]:
    actions: list[str] = []

    def _walk(node: Any) -> None:
        if isinstance(node, dict):
            sel = node.get("selection")
            if isinstance(sel, dict):
                act = str(sel.get("action") or "").strip()
                if act and act not in actions:
                    actions.append(act)
            for value in node.values():
                _walk(value)
        elif isinstance(node, list):
            for item in node:
                _walk(item)

    _walk(card_payload)
    return actions


def create_card_chat(
    narration: str,
    *,
    card_kind: str,
    card_payload: dict[str, Any],
    is_terminal: bool = False,
    drawer_width_px: int | None = None,
    extra_metadata: dict[str, str] | None = None,
    include_text: bool = True,
    card_id: str | None = None,
) -> ChatMessage:
    payload = card_payload
    if card_id:
        payload = copy.deepcopy(card_payload)
        stamp_card_id(payload, card_id)
    metadata: dict[str, str] = {
        "card_protocol_version": CARD_PROTOCOL_VERSION,
        "requires_card_interaction": "true",
        "card_kind": str(card_kind),
        "card_payload": json.dumps(payload, ensure_ascii=False),
    }
    if card_id:
        metadata["card_id"] = str(card_id)
    if is_terminal:
        metadata["is_terminal"] = "true"
    if drawer_width_px:
        metadata["preferred_drawer_width_px"] = str(int(drawer_width_px))
    if extra_metadata:
        for meta_key, meta_value in extra_metadata.items():
            metadata[str(meta_key)] = str(meta_value)
    content: list[Any] = [MetadataContent(type="metadata", metadata=metadata)]
    if include_text and narration:
        content.insert(0, TextContent(type="text", text=narration))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


def parse_card_selection(text: str, known_actions: set[str] | None = None) -> dict[str, Any]:
    raw = (text or "").strip()
    if not raw:
        return {}
    stripped = _MENTION_PREFIX_RE.sub("", raw).strip()
    for candidate in (stripped, raw):
        if not candidate:
            continue
        try:
            data = json.loads(candidate)
        except Exception:
            data = None
        if isinstance(data, dict):
            return data
    if known_actions:
        lowered = strip_mention_prefix(raw).lower().replace("_", " ")
        # Word-boundary matching so "payment" does not trigger "pay",
        # and "generate post" (button label) matches action "generate_post".
        matches: list[tuple[int, int, str]] = []
        for action in known_actions:
            action_l = action.lower()
            best: tuple[int, int] | None = None
            for variant in {action_l, action_l.replace("_", " ")}:
                if not variant:
                    continue
                found = re.search(rf"\b{re.escape(variant)}\b", lowered)
                if found and (best is None or found.start() < best[0]):
                    best = (found.start(), len(variant))
            if best is not None:
                matches.append((best[0], -best[1], action))
        if matches:
            matches.sort()
            return {"action": matches[0][2]}
        for label, alias_action in LABEL_ALIASES.items():
            if alias_action in known_actions and re.search(rf"\b{re.escape(label)}\b", lowered):
                return {"action": alias_action}
    return {}


def normalize_card_selection(text: str, known_actions: set[str] | None = None) -> dict[str, Any]:
    sel = parse_card_selection(text, known_actions)
    if not isinstance(sel, dict):
        return {}
    if not str(sel.get("action") or "").strip() and isinstance(sel.get("selection"), dict):
        merged = {**sel, **sel["selection"]}
        merged.pop("selection", None)
        return merged
    return sel


def selection_card_id(sel: dict[str, Any]) -> str:
    if not isinstance(sel, dict):
        return ""
    direct = str(sel.get("card_id") or "").strip()
    if direct:
        return direct
    inner = sel.get("selection")
    if isinstance(inner, dict):
        return str(inner.get("card_id") or "").strip()
    return ""
