"""CRUD operations for RefreshToken — backs server-side logout/rotation."""
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.token import RefreshToken


def create(db: Session, *, user_id: uuid.UUID, payload: dict[str, Any]) -> RefreshToken:
    db_obj = RefreshToken(
        jti=payload["jti"],
        user_id=user_id,
        expires_at=payload["exp"],
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_by_jti(db: Session, jti: str) -> Optional[RefreshToken]:
    return db.scalar(select(RefreshToken).where(RefreshToken.jti == jti))


def revoke(db: Session, db_obj: RefreshToken) -> None:
    db_obj.revoked = True
    db.add(db_obj)
    db.commit()


def is_valid(db_obj: Optional[RefreshToken]) -> bool:
    if db_obj is None or db_obj.revoked:
        return False
    expires_at = db_obj.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def revoke_all_for_user(db: Session, user_id: uuid.UUID) -> None:
    tokens = db.scalars(select(RefreshToken).where(RefreshToken.user_id == user_id, RefreshToken.revoked.is_(False)))
    for token in tokens:
        token.revoked = True
    db.commit()
