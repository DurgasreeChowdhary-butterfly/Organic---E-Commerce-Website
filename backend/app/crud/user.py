"""CRUD operations for User."""
import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get(db: Session, id: uuid.UUID) -> Optional[User]:
    return db.get(User, id)


def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.scalar(select(User).where(User.email == email))


def get_by_phone(db: Session, phone: str) -> Optional[User]:
    return db.scalar(select(User).where(User.phone == phone))


def get_multi(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return list(db.scalars(select(User).offset(skip).limit(limit)))


def create(db: Session, obj_in: UserCreate) -> User:
    db_obj = User(
        full_name=obj_in.full_name,
        email=obj_in.email,
        phone=obj_in.phone,
        hashed_password=hash_password(obj_in.password),
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: User, obj_in: UserUpdate) -> User:
    for field, value in obj_in.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, id: uuid.UUID) -> None:
    db_obj = db.get(User, id)
    if db_obj is not None:
        db.delete(db_obj)
        db.commit()


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user
