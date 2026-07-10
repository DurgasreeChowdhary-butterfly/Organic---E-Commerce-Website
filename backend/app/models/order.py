"""Order and OrderItem models."""
import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    SHIPPED = "shipped"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    address_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("addresses.id"))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    gst_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    shipping_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    coupon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coupons.id"), nullable=True)
    razorpay_order_id: Mapped[str] = mapped_column(String(100), nullable=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String(100), nullable=True)
    invoice_url: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))

    order: Mapped["Order"] = relationship(back_populates="items")
