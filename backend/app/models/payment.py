"""Razorpay payment/transaction model.

Deliberately separate from (the not-yet-implemented) Order model: a Payment
row is created the moment we ask Razorpay for an order, and is the
authoritative record of what was charged, to whom, and for what — cart
snapshot, coupon, address, and the full GST/discount/shipping breakdown are
all captured here. Order creation (turning a successful Payment into an
Order a customer can track) is out of scope for this module.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PaymentStatus(str, enum.Enum):
    CREATED = "created"
    SUCCESS = "success"
    FAILED = "failed"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    address_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("addresses.id"))
    coupon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coupons.id"), nullable=True)

    razorpay_order_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String(100), nullable=True, unique=True)
    razorpay_signature: Mapped[str] = mapped_column(String(255), nullable=True)

    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.CREATED)
    failure_reason: Mapped[str] = mapped_column(String(255), nullable=True)

    currency: Mapped[str] = mapped_column(String(3), default="INR")
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    gst_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    shipping_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    amount: Mapped[float] = mapped_column(Numeric(10, 2))

    # Snapshot of cart line items at the moment the Razorpay order was
    # created — [{product_id, name, sku, quantity, unit_price, gst_percentage, line_total}, ...]
    # so GST invoice data survives even if the cart changes afterward.
    cart_snapshot: Mapped[list] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    address: Mapped["Address"] = relationship()
    coupon: Mapped["Coupon"] = relationship()
