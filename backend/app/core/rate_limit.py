"""
Lightweight in-memory fixed-window rate limiter for abuse-prone public endpoints
(e.g. the AI Assistant chat endpoint). Not distributed - fine for a single backend
process; swap for a Redis-backed limiter if the app is scaled to multiple workers.
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, status

_WINDOW_SECONDS = 60
_MAX_REQUESTS = 20

_buckets: dict[str, deque] = defaultdict(deque)
_lock = Lock()


def enforce_rate_limit(key: str, max_requests: int = _MAX_REQUESTS, window_seconds: int = _WINDOW_SECONDS) -> None:
    now = time.monotonic()
    with _lock:
        bucket = _buckets[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many messages. Please wait a moment before trying again.",
            )
        bucket.append(now)
