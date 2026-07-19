"""CRUD operations for PasswordResetToken — backs the forgot/reset password
flow. Only a SHA-256 hash of the token is ever stored or queried; the raw
token exists only transiently (returned once, emailed, never logged)."""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.token import PasswordResetToken


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create(db: Session, *, user_id: uuid.UUID) -> str:
    """Invalidate any existing active token for the user (only one active
    token per user), then issue a fresh one. Returns the raw token."""
    invalidate_all_for_user(db, user_id)

    raw_token = secrets.token_urlsafe(32)
    db_obj = PasswordResetToken(
        user_id=user_id,
        token_hash=_hash_token(raw_token),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(db_obj)
    db.commit()
    return raw_token


def get_valid_by_raw_token(db: Session, raw_token: str) -> Optional[PasswordResetToken]:
    """Look up the token by its hash. The lookup itself needs no additional
    constant-time comparison: the hash is derived from a 256-bit random
    value, so an attacker without the raw token cannot narrow it down via
    timing regardless of how the equality check is performed."""
    db_obj = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == _hash_token(raw_token)))
    if db_obj is None or db_obj.used:
        return None

    expires_at = db_obj.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        return None

    return db_obj


def mark_used(db: Session, db_obj: PasswordResetToken) -> None:
    db_obj.used = True
    db.add(db_obj)
    db.commit()


def invalidate_all_for_user(db: Session, user_id: uuid.UUID) -> None:
    tokens = db.scalars(
        select(PasswordResetToken).where(PasswordResetToken.user_id == user_id, PasswordResetToken.used.is_(False))
    )
    for token in tokens:
        token.used = True
    db.commit()
