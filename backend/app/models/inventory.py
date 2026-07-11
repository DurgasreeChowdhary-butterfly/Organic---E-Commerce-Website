"""Inventory transaction (stock movement) model — the audit trail for every
stock change. No code should mutate Product.stock_quantity directly; every
change must go through crud/inventory.py's adjust_stock(), which writes one
of these rows in the same transaction.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MovementType(str, enum.Enum):
    ORDER = "order"
    ORDER_CANCELLED = "order_cancelled"
    MANUAL_INCREASE = "manual_increase"
    MANUAL_DECREASE = "manual_decrease"
    CORRECTION = "correction"
    REFUND_RESTOCK = "refund_restock"


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    movement_type: Mapped[MovementType] = mapped_column(Enum(MovementType))
    quantity_change: Mapped[int] = mapped_column(Integer)
    stock_before: Mapped[int] = mapped_column(Integer)
    stock_after: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(255), nullable=True)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"), nullable=True)
    admin_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship()
    order: Mapped["Order"] = relationship()
    admin: Mapped["User"] = relationship()
