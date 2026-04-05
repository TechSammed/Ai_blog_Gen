from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from core.logger import get_logger

logger = get_logger("cache")

_CACHE_TTL_HOURS = 24
_CACHE_DIR = Path(__file__).resolve().parents[1] / ".cache"
_CACHE_FILE = _CACHE_DIR / "generation_cache.json"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_keyword(keyword: str) -> str:
    return " ".join(keyword.lower().split())


class GenerationCache:
    """Simple JSON file cache for generated keyword responses."""

    def __init__(self, cache_file: Path = _CACHE_FILE, ttl_hours: int = _CACHE_TTL_HOURS) -> None:
        self.cache_file = cache_file
        self.ttl = timedelta(hours=ttl_hours)

    def _load_raw(self) -> dict[str, Any]:
        if not self.cache_file.exists():
            return {}
        try:
            return json.loads(self.cache_file.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.warning("Cache read failed (%s). Ignoring cache file.", exc)
            return {}

    def _save_raw(self, data: dict[str, Any]) -> None:
        self.cache_file.parent.mkdir(parents=True, exist_ok=True)
        self.cache_file.write_text(json.dumps(data, ensure_ascii=True, indent=2), encoding="utf-8")

    def get(self, keyword: str) -> dict[str, Any] | None:
        key = _normalize_keyword(keyword)
        now = _utc_now()
        data = self._load_raw()
        entry = data.get(key)
        if not isinstance(entry, dict):
            return None

        ts = entry.get("created_at")
        payload = entry.get("payload")
        if not ts or not isinstance(payload, dict):
            return None

        try:
            created_at = datetime.fromisoformat(ts)
        except Exception:
            return None

        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        if now - created_at > self.ttl:
            data.pop(key, None)
            self._save_raw(data)
            return None

        return payload

    def set(self, keyword: str, payload: dict[str, Any]) -> None:
        key = _normalize_keyword(keyword)
        data = self._load_raw()
        data[key] = {
            "created_at": _utc_now().isoformat(),
            "payload": payload,
        }
        self._save_raw(data)
