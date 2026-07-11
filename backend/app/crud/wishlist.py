"""CRUD operations for Wishlist. Adding an already-saved product is
idempotent (returns the existing wishlist unchanged) rather than erroring,
which keeps a toggle-style UI simple; the DB-level unique constraint on
(wishlist_id, product_id) is the hard guarantee against duplicates.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.product import Product
from app.models.wishlist import Wishlist, WishlistItem


class WishlistItemNotFound(Exception):
    """Raised when a product isn't present in the user's wishlist."""


def _with_items(query):
    return query.options(selectinload(Wishlist.items).selectinload(WishlistItem.product))


def get_or_create_wishlist(db: Session, user_id: uuid.UUID) -> Wishlist:
    wishlist = db.scalar(_with_items(select(Wishlist).where(Wishlist.user_id == user_id)))
    if wishlist is None:
        wishlist = Wishlist(user_id=user_id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
        wishlist = db.scalar(_with_items(select(Wishlist).where(Wishlist.id == wishlist.id)))
    return wishlist


def add_item(db: Session, wishlist: Wishlist, product: Product) -> Wishlist:
    existing = next((i for i in wishlist.items if i.product_id == product.id), None)
    if existing is None:
        db.add(WishlistItem(wishlist_id=wishlist.id, product_id=product.id))
        db.commit()
    return get_or_create_wishlist(db, wishlist.user_id)


def remove_item(db: Session, wishlist: Wishlist, product_id: uuid.UUID) -> Wishlist:
    item = next((i for i in wishlist.items if i.product_id == product_id), None)
    if item is None:
        raise WishlistItemNotFound()
    db.delete(item)
    db.commit()
    return get_or_create_wishlist(db, wishlist.user_id)
