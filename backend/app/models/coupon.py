"""Coupon model."""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FLAT = "flat"


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    discount_type: Mapped[DiscountType] = mapped_column(Enum(DiscountType))
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2))
    min_order_value: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    max_uses: Mapped[int] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    valid_until: Mapped[datetime] = mapped_column(DateTime, nullable=True)
