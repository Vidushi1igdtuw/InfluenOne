"""Upload ASI:One data-URL images to Supabase so the UI can render an https URL."""

from __future__ import annotations

import base64
import os
import re
import uuid


def persist_generated_image(image_url: str) -> str:
    raw = (image_url or "").strip()
    if not raw:
        return ""
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    match = re.match(r"^data:(image/[\w.+-]+);base64,(.+)$", raw, re.DOTALL)
    if not match:
        return raw
    mime = match.group(1).lower()
    try:
        blob = base64.b64decode(match.group(2))
    except Exception:
        return raw
    if not blob:
        return raw
    ext = "jpg" if "jpeg" in mime or mime.endswith("/jpg") else mime.split("/", 1)[-1]
    if ext not in {"png", "jpg", "jpeg", "webp", "gif"}:
        ext = "jpg"
        mime = "image/jpeg"
    supabase_url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or ""
    if not supabase_url or not key:
        return raw
    try:
        from supabase import create_client

        client = create_client(supabase_url, key)
        path = f"generated/{uuid.uuid4()}.{ext}"
        client.storage.from_("images").upload(
            path,
            blob,
            {"content-type": mime, "upsert": "true"},
        )
        public = client.storage.from_("images").get_public_url(path)
        return str(public or "").rstrip("?") or raw
    except Exception:
        return raw
