"""CRUD helpers for the customer address book."""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import Address
from app.schemas.address import AddressCreate, AddressUpdate


class AddressNotFound(Exception):
    pass


def list_for_user(db: Session, user_id: uuid.UUID) -> list[Address]:
    stmt = select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc())
    return list(db.execute(stmt).scalars().all())


def get_for_user(db: Session, user_id: uuid.UUID, address_id: uuid.UUID) -> Address:
    stmt = select(Address).where(Address.id == address_id, Address.user_id == user_id)
    address = db.execute(stmt).scalar_one_or_none()
    if address is None:
        raise AddressNotFound()
    return address


def _unset_existing_default(db: Session, user_id: uuid.UUID, exclude_id: uuid.UUID | None = None) -> None:
    stmt = select(Address).where(Address.user_id == user_id, Address.is_default.is_(True))
    if exclude_id is not None:
        stmt = stmt.where(Address.id != exclude_id)
    existing_defaults = list(db.execute(stmt).scalars().all())
    for existing in existing_defaults:
        existing.is_default = False
    if existing_defaults:
        # Flush the "unset" immediately, in its own statement, before any
        # caller sets a different row's is_default=True in the same flush —
        # otherwise SQLAlchemy may batch both UPDATEs into one executemany
        # round-trip in an order that momentarily has two rows with
        # is_default=true, tripping the partial unique index.
        db.flush()


def create(db: Session, user_id: uuid.UUID, payload: AddressCreate) -> Address:
    is_first_address = len(list_for_user(db, user_id)) == 0
    make_default = payload.is_default or is_first_address

    if make_default:
        _unset_existing_default(db, user_id)

    address = Address(user_id=user_id, **payload.model_dump(exclude={"is_default"}), is_default=make_default)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update(db: Session, user_id: uuid.UUID, address_id: uuid.UUID, payload: AddressUpdate) -> Address:
    address = get_for_user(db, user_id, address_id)
    data = payload.model_dump(exclude_unset=True, exclude={"is_default"})
    for key, value in data.items():
        setattr(address, key, value)

    if payload.is_default is True:
        _unset_existing_default(db, user_id, exclude_id=address.id)
        address.is_default = True
    elif payload.is_default is False:
        address.is_default = False

    db.commit()
    db.refresh(address)
    return address


def delete(db: Session, user_id: uuid.UUID, address_id: uuid.UUID) -> None:
    address = get_for_user(db, user_id, address_id)
    was_default = address.is_default
    db.delete(address)
    db.flush()

    if was_default:
        remaining = list_for_user(db, user_id)
        if remaining:
            remaining[0].is_default = True

    db.commit()


def set_default(db: Session, user_id: uuid.UUID, address_id: uuid.UUID) -> Address:
    address = get_for_user(db, user_id, address_id)
    _unset_existing_default(db, user_id, exclude_id=address.id)
    address.is_default = True
    db.commit()
    db.refresh(address)
    return address
