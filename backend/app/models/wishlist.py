"""Wishlist and WishlistItem models."""
import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)

    items: Mapped[list["WishlistItem"]] = relationship(back_populates="wishlist")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    wishlist_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wishlists.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))

    wishlist: Mapped["Wishlist"] = relationship(back_populates="items")
