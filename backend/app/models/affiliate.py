"""Affiliate model — a 1:1 marketing-program profile on top of an existing
User account (not a separate account type), plus the click log used for the
"Total Clicks" dashboard stat.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AffiliateStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    BLOCKED = "blocked"


class Affiliate(Base):
    __tablename__ = "affiliates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    affiliate_code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    status: Mapped[AffiliateStatus] = mapped_column(Enum(AffiliateStatus), default=AffiliateStatus.PENDING, index=True)
    commission_percentage: Mapped[float] = mapped_column(Numeric(5, 2), default=5.00)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    approved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship()
    clicks: Mapped[list["AffiliateClick"]] = relationship(back_populates="affiliate", cascade="all, delete-orphan")


class AffiliateClick(Base):
    """One row per landing hit on an affiliate link. Deliberately minimal —
    no IP/user-agent/customer data is stored, only what's needed for the
    click counter."""

    __tablename__ = "affiliate_clicks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), index=True)
    landing_path: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    affiliate: Mapped["Affiliate"] = relationship(back_populates="clicks")
