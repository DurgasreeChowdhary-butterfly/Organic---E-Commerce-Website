"""CRUD and validation logic for Coupons."""
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.coupon import Coupon, CouponRedemption, DiscountType
from app.schemas.coupon import CouponCreate, CouponUpdate


class CouponNotFound(Exception):
    pass


class CouponError(Exception):
    """Base for validation failures — message is user-facing."""


class CouponInactive(CouponError):
    def __init__(self):
        super().__init__("This coupon is no longer active")


class CouponNotYetValid(CouponError):
    def __init__(self):
        super().__init__("This coupon is not valid yet")


class CouponExpired(CouponError):
    def __init__(self):
        super().__init__("This coupon has expired")


class CouponMinOrderNotMet(CouponError):
    def __init__(self, min_order_value: float):
        self.min_order_value = min_order_value
        super().__init__(f"Add items worth ₹{min_order_value:.0f} more to use this coupon")


class CouponUsageLimitExceeded(CouponError):
    def __init__(self):
        super().__init__("This coupon has reached its usage limit")


class CouponPerUserLimitExceeded(CouponError):
    def __init__(self):
        super().__init__("You have already used this coupon the maximum number of times")


def get(db: Session, coupon_id: uuid.UUID, *, for_update: bool = False) -> Coupon:
    coupon = db.get(Coupon, coupon_id, with_for_update=for_update)
    if coupon is None:
        raise CouponNotFound()
    return coupon


def get_by_code(db: Session, code: str) -> Optional[Coupon]:
    return db.scalar(select(Coupon).where(Coupon.code == code.strip().upper()))


@dataclass
class CouponFilters:
    search: Optional[str] = None
    is_active: Optional[bool] = None
    page: int = 1
    page_size: int = 20


def list_coupons(db: Session, filters: CouponFilters) -> tuple[list[Coupon], int]:
    query = select(Coupon)
    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.where(Coupon.code.ilike(like))
    if filters.is_active is not None:
        query = query.where(Coupon.is_active.is_(filters.is_active))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    items = list(
        db.execute(query.order_by(Coupon.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
        .scalars()
        .all()
    )
    return items, total


def create(db: Session, payload: CouponCreate) -> Coupon:
    coupon = Coupon(**payload.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


def update(db: Session, coupon_id: uuid.UUID, payload: CouponUpdate) -> Coupon:
    coupon = get(db, coupon_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(coupon, key, value)
    db.commit()
    db.refresh(coupon)
    return coupon


def delete(db: Session, coupon_id: uuid.UUID) -> None:
    coupon = get(db, coupon_id)
    db.delete(coupon)
    db.commit()


def set_active(db: Session, coupon_id: uuid.UUID, is_active: bool) -> Coupon:
    coupon = get(db, coupon_id)
    coupon.is_active = is_active
    db.commit()
    db.refresh(coupon)
    return coupon


def user_redemption_count(db: Session, coupon_id: uuid.UUID, user_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(CouponRedemption).where(
        CouponRedemption.coupon_id == coupon_id, CouponRedemption.user_id == user_id
    )
    return db.scalar(stmt) or 0


def validate_for_order(db: Session, code: str, user_id: uuid.UUID, order_value: float) -> Coupon:
    """Validate a coupon code against an order value and the user's redemption
    history. Raises a CouponError subclass (or CouponNotFound) on failure."""
    coupon = get_by_code(db, code)
    if coupon is None:
        raise CouponNotFound()
    if not coupon.is_active:
        raise CouponInactive()

    now = datetime.utcnow()
    if coupon.valid_from and now < coupon.valid_from:
        raise CouponNotYetValid()
    if coupon.valid_until and now > coupon.valid_until:
        raise CouponExpired()

    if order_value < float(coupon.min_order_value):
        raise CouponMinOrderNotMet(float(coupon.min_order_value))

    if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
        raise CouponUsageLimitExceeded()

    if coupon.per_user_limit is not None:
        if user_redemption_count(db, coupon.id, user_id) >= coupon.per_user_limit:
            raise CouponPerUserLimitExceeded()

    return coupon


def compute_discount(coupon: Coupon, order_value: float) -> float:
    """Discount amount for `order_value` (the post-product-discount cart total)."""
    if coupon.discount_type == DiscountType.FLAT:
        discount = float(coupon.discount_value)
    else:
        discount = order_value * float(coupon.discount_value) / 100
        if coupon.max_discount is not None:
            discount = min(discount, float(coupon.max_discount))
    return round(min(discount, order_value), 2)


def redeem_if_valid(
    db: Session, coupon_id: uuid.UUID, user_id: uuid.UUID, payment_id: uuid.UUID, order_value: float
) -> bool:
    """Lock the coupon row and re-validate + redeem atomically.

    A coupon is first validated when the customer applies it at checkout,
    but payment capture happens afterward on Razorpay's side, so another
    concurrent checkout could also pass validation before either redemption
    is recorded (TOCTOU race on `used_count`/`max_uses`/`per_user_limit`).
    Locking the row here serializes concurrent redemptions so the usage
    count can never be pushed past its limit.

    Returns False (without raising) if the coupon is no longer valid by the
    time payment was verified — the caller's order must still be created
    since payment was already captured; only the redemption bookkeeping is
    skipped in that case.
    """
    coupon = db.get(Coupon, coupon_id, with_for_update=True)
    if coupon is None:
        return False
    try:
        validate_for_order(db, coupon.code, user_id, order_value)
    except (CouponNotFound, CouponError):
        return False
    db.add(CouponRedemption(coupon_id=coupon.id, user_id=user_id, payment_id=payment_id))
    coupon.used_count += 1
    db.commit()
    return True
