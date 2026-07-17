"""Commission attribution and lifecycle — the single earning ledger shared
by affiliate referrals and influencer coupons.

Attribution priority (see plan / attribute_order docstring): an influencer
coupon used on the order always wins; a stored affiliate-link referral only
earns a commission if no influencer coupon was used. A normal (non-
influencer) coupon is never itself a commission source and never blocks
affiliate attribution.
"""
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.affiliate import Affiliate, AffiliateStatus
from app.models.commission import Commission, CommissionSource, CommissionStatus
from app.models.coupon import Coupon
from app.models.order import Order
from app.models.payment import Payment


def attribute_order(db: Session, payment: Payment, order: Order) -> Optional[Commission]:
    """Create the (at most one) Commission for a newly-confirmed order.

    Called once from the payment-verification flow, immediately after the
    Order is created from a successfully-verified Payment. Idempotent by
    construction: `commissions.order_id` is unique, so calling this twice
    for the same order would raise an integrity error rather than double-pay
    — it is only ever invoked from that single call site.
    """
    coupon: Optional[Coupon] = payment.coupon

    if coupon is not None and coupon.is_influencer:
        percentage = float(coupon.influencer_commission_percentage or 0)
        if percentage <= 0:
            return None
        amount = round(float(order.total_amount) * percentage / 100, 2)
        commission = Commission(
            source=CommissionSource.INFLUENCER_COUPON,
            coupon_id=coupon.id,
            order_id=order.id,
            percentage_applied=percentage,
            amount=amount,
            status=CommissionStatus.PENDING,
        )
        db.add(commission)
        db.commit()
        db.refresh(commission)
        return commission

    if payment.affiliate_id is not None:
        affiliate = db.get(Affiliate, payment.affiliate_id)
        # Re-check status at attribution time too (it could have been
        # blocked between checkout and payment verification).
        if affiliate is None or affiliate.status != AffiliateStatus.APPROVED:
            return None
        percentage = float(affiliate.commission_percentage)
        amount = round(float(order.total_amount) * percentage / 100, 2)
        commission = Commission(
            source=CommissionSource.AFFILIATE,
            affiliate_id=affiliate.id,
            order_id=order.id,
            percentage_applied=percentage,
            amount=amount,
            status=CommissionStatus.PENDING,
        )
        db.add(commission)
        db.commit()
        db.refresh(commission)
        return commission

    return None


def get_for_order(db: Session, order_id: uuid.UUID) -> Optional[Commission]:
    return db.scalar(select(Commission).where(Commission.order_id == order_id))


def mark_earned(db: Session, order_id: uuid.UUID) -> None:
    """Order reached DELIVERED — its (still-pending) commission clears the
    return-window hold and becomes payable."""
    commission = get_for_order(db, order_id)
    if commission is None or commission.status != CommissionStatus.PENDING:
        return
    commission.status = CommissionStatus.EARNED
    commission.earned_at = datetime.utcnow()
    db.commit()


def reverse(db: Session, order_id: uuid.UUID) -> None:
    """Order was cancelled or refunded — any non-final commission for it is
    reversed. A commission that was already PAID is left untouched here;
    that requires a manual admin clawback, not an automatic one."""
    commission = get_for_order(db, order_id)
    if commission is None or commission.status in (CommissionStatus.PAID, CommissionStatus.REVERSED):
        return
    commission.status = CommissionStatus.REVERSED
    commission.reversed_at = datetime.utcnow()
    db.commit()


def mark_paid(db: Session, commission_id: uuid.UUID) -> Commission:
    commission = db.get(Commission, commission_id)
    if commission is None:
        raise ValueError("Commission not found")
    if commission.status != CommissionStatus.EARNED:
        raise ValueError("Only earned commissions can be marked paid")
    commission.status = CommissionStatus.PAID
    commission.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(commission)
    return commission


@dataclass
class CommissionFilters:
    affiliate_id: Optional[uuid.UUID] = None
    status: Optional[CommissionStatus] = None
    page: int = 1
    page_size: int = 20


def list_admin(db: Session, filters: CommissionFilters) -> tuple[list[Commission], int]:
    query = select(Commission)
    if filters.affiliate_id is not None:
        query = query.where(Commission.affiliate_id == filters.affiliate_id)
    if filters.status is not None:
        query = query.where(Commission.status == filters.status)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    items = list(
        db.execute(
            query.options(selectinload(Commission.order))
            .order_by(Commission.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total
