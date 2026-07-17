"""CRUD and business logic for Affiliates and affiliate-link click tracking."""
import random
import re
import string
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.affiliate import Affiliate, AffiliateClick, AffiliateStatus
from app.models.commission import Commission, CommissionStatus
from app.models.order import Order
from app.models.user import User


class AffiliateNotFound(Exception):
    pass


class AffiliateAlreadyRegistered(Exception):
    def __init__(self):
        super().__init__("You already have an affiliate account")


def get(db: Session, affiliate_id: uuid.UUID) -> Affiliate:
    affiliate = db.get(Affiliate, affiliate_id)
    if affiliate is None:
        raise AffiliateNotFound()
    return affiliate


def get_by_user_id(db: Session, user_id: uuid.UUID) -> Optional[Affiliate]:
    return db.scalar(select(Affiliate).where(Affiliate.user_id == user_id))


def get_by_code(db: Session, code: str) -> Optional[Affiliate]:
    return db.scalar(select(Affiliate).where(Affiliate.affiliate_code == code.strip().upper()))


def _generate_code(db: Session, full_name: str) -> str:
    """DURGA123-style code: first 5 letters of the name (uppercased,
    non-alpha stripped, padded if short) + a random 3-digit suffix, retried
    on collision."""
    letters = re.sub(r"[^A-Za-z]", "", full_name).upper()[:5] or "AFF"
    for _ in range(20):
        candidate = f"{letters}{random.randint(100, 999)}"
        if get_by_code(db, candidate) is None:
            return candidate
    # Extremely unlikely fallback: fully random 8-char code.
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def register(db: Session, user: User) -> Affiliate:
    if get_by_user_id(db, user.id) is not None:
        raise AffiliateAlreadyRegistered()
    affiliate = Affiliate(user_id=user.id, affiliate_code=_generate_code(db, user.full_name))
    db.add(affiliate)
    db.commit()
    db.refresh(affiliate)
    return affiliate


def is_attribution_eligible(affiliate: Affiliate, click_timestamp: Optional[datetime]) -> bool:
    """Server-side re-validation of a client-supplied ref: the affiliate must
    be approved, and the click must be within the configured attribution
    window (defends against a stale/forged localStorage timestamp being used
    to attribute a very old visit)."""
    if affiliate.status != AffiliateStatus.APPROVED:
        return False
    if click_timestamp is None:
        return True
    expiry = click_timestamp + timedelta(days=settings.AFFILIATE_ATTRIBUTION_DAYS)
    return datetime.utcnow() <= expiry


def record_click(db: Session, affiliate: Affiliate, landing_path: Optional[str]) -> None:
    db.add(AffiliateClick(affiliate_id=affiliate.id, landing_path=(landing_path or "")[:255]))
    db.commit()


# --- Admin management ---


@dataclass
class AffiliateFilters:
    search: Optional[str] = None
    status: Optional[AffiliateStatus] = None
    page: int = 1
    page_size: int = 20


def list_admin(db: Session, filters: AffiliateFilters) -> tuple[list[Affiliate], int]:
    query = select(Affiliate).join(User, User.id == Affiliate.user_id)
    if filters.status is not None:
        query = query.where(Affiliate.status == filters.status)
    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.where(
            or_(Affiliate.affiliate_code.ilike(like), User.full_name.ilike(like), User.email.ilike(like))
        )

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    items = list(
        db.execute(
            query.options(selectinload(Affiliate.user))
            .order_by(Affiliate.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def set_status(db: Session, affiliate_id: uuid.UUID, status: AffiliateStatus) -> Affiliate:
    affiliate = get(db, affiliate_id)
    affiliate.status = status
    if status == AffiliateStatus.APPROVED and affiliate.approved_at is None:
        affiliate.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(affiliate)
    return affiliate


def set_commission_percentage(db: Session, affiliate_id: uuid.UUID, percentage: float) -> Affiliate:
    affiliate = get(db, affiliate_id)
    affiliate.commission_percentage = percentage
    db.commit()
    db.refresh(affiliate)
    return affiliate


# --- Dashboard aggregation (affiliate's own view + admin performance view) ---


def click_count(db: Session, affiliate_id: uuid.UUID) -> int:
    return db.scalar(select(func.count()).select_from(AffiliateClick).where(AffiliateClick.affiliate_id == affiliate_id)) or 0


def commission_totals(db: Session, affiliate_id: uuid.UUID) -> dict:
    rows = db.execute(
        select(Commission.status, func.coalesce(func.sum(Commission.amount), 0), func.count())
        .where(Commission.affiliate_id == affiliate_id)
        .group_by(Commission.status)
    ).all()
    totals = {"pending": 0.0, "earned": 0.0, "paid": 0.0, "reversed": 0.0}
    order_count = 0
    sales_total = 0.0
    for status, amount, count in rows:
        totals[status.value] = float(amount)
        if status != CommissionStatus.REVERSED:
            order_count += count

    sales_total = db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.affiliate_id == affiliate_id)
    ) or 0

    return {
        "total_orders": order_count,
        "total_sales": float(sales_total),
        "commission_pending": totals["pending"],
        "commission_earned": totals["earned"],
        "commission_paid": totals["paid"],
    }


def attributed_orders(db: Session, affiliate_id: uuid.UUID) -> list[tuple[Order, Optional[Commission]]]:
    orders = list(
        db.scalars(
            select(Order).where(Order.affiliate_id == affiliate_id).order_by(Order.created_at.desc())
        )
    )
    commissions = {
        c.order_id: c
        for c in db.scalars(select(Commission).where(Commission.affiliate_id == affiliate_id))
    }
    return [(order, commissions.get(order.id)) for order in orders]
