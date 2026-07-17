"""Commission model — the single earning ledger shared by both affiliate
referrals and influencer coupons (see crud/commission.py `attribute_order`
for the attribution-priority rule between the two sources).
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CommissionSource(str, enum.Enum):
    AFFILIATE = "affiliate"
    INFLUENCER_COUPON = "influencer_coupon"


class CommissionStatus(str, enum.Enum):
    PENDING = "pending"
    EARNED = "earned"
    PAID = "paid"
    REVERSED = "reversed"


class Commission(Base):
    __tablename__ = "commissions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    source: Mapped[CommissionSource] = mapped_column(Enum(CommissionSource))
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), nullable=True, index=True)
    coupon_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("coupons.id"), nullable=True, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"), unique=True, index=True)

    # Snapshotted at creation time so later commission-% edits never
    # retroactively change an already-placed order's commission.
    percentage_applied: Mapped[float] = mapped_column(Numeric(5, 2))
    amount: Mapped[float] = mapped_column(Numeric(10, 2))

    status: Mapped[CommissionStatus] = mapped_column(Enum(CommissionStatus), default=CommissionStatus.PENDING, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    earned_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    reversed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    affiliate: Mapped["Affiliate"] = relationship()
    coupon: Mapped["Coupon"] = relationship()
    order: Mapped["Order"] = relationship()
