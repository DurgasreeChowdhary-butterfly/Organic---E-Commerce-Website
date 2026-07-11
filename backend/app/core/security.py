"""
Password hashing and JWT access/refresh token utilities.

Password hashing uses the `bcrypt` library directly rather than passlib:
passlib 1.7.x is unmaintained and breaks on bcrypt>=4.1 (it probes
`bcrypt.__about__`, which no longer exists), so bcrypt is used as-is.
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal, Optional

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

BCRYPT_MAX_BYTES = 72  # bcrypt silently ignores bytes beyond this


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    password_bytes = plain_password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its bcrypt hash."""
    password_bytes = plain_password.encode("utf-8")[:BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))
    except ValueError:
        # Malformed hash (e.g. legacy/corrupt data) — never authenticate.
        return False


def _create_token(subject: str, token_type: Literal["access", "refresh"], expires_delta: timedelta) -> tuple[str, dict[str, Any]]:
    now = datetime.now(timezone.utc)
    jti = str(uuid.uuid4())
    expires_at = now + expires_delta
    payload = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": now,
        "exp": expires_at,
    }
    # jose.jwt.encode mutates `payload` in place, rewriting datetime claims
    # (exp/iat) to integer timestamps — capture jti/expires_at beforehand
    # rather than relying on the (now-mutated) dict afterwards.
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, {"jti": jti, "exp": expires_at}


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token for `subject` (the user id)."""
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token, _ = _create_token(subject, "access", delta)
    return token


def create_refresh_token(subject: str) -> tuple[str, dict[str, Any]]:
    """Create a signed JWT refresh token for `subject`, returning (token, payload)."""
    delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_token(subject, "refresh", delta)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT, raising jose.JWTError on failure."""
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise
