"""Coupon model."""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, Boolean, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
    max_discount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    max_uses: Mapped[int] = mapped_column(Integer, nullable=True)
    per_user_limit: Mapped[int] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    valid_from: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    valid_until: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Influencer coupons: `discount_value` (above) is still the customer's
    # discount. `influencer_commission_percentage` is a separate cut paid to
    # the influencer, computed off the order total on successful payment —
    # see crud/commission.py `attribute_order`.
    is_influencer: Mapped[bool] = mapped_column(Boolean, default=False)
    influencer_name: Mapped[str] = mapped_column(String(255), nullable=True)
    influencer_commission_percentage: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True)

    redemptions: Mapped[list["CouponRedemption"]] = relationship(back_populates="coupon", cascade="all, delete-orphan")


class CouponRedemption(Base):
    """One row per successful (payment-confirmed) use of a coupon by a user."""

    __tablename__ = "coupon_redemptions"
    __table_args__ = (UniqueConstraint("coupon_id", "payment_id", name="uq_coupon_redemption_payment"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    coupon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coupons.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    payment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("payments.id"))
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    coupon: Mapped["Coupon"] = relationship(back_populates="redemptions")
