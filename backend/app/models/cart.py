"""Cart and CartItem models."""
import uuid
from datetime import datetime

from sqlalchemy import Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["CartItem"]] = relationship(back_populates="cart")


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    cart_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("carts.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)

    cart: Mapped["Cart"] = relationship(back_populates="items")
