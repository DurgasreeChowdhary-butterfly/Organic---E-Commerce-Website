"""CRUD/aggregation queries for admin customer management.

'Order count' includes every order regardless of status. 'Total purchase
value' only counts valid (non-refunded) orders, consistent with the revenue
definition used for dashboard analytics (crud/dashboard.py) - an order only
ever exists after payment already succeeded, so a refund is the only event
that reverses it.
"""
import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.crud.dashboard import REVENUE_EXCLUDED_STATUSES
from app.models.order import Order
from app.models.user import Address, User


class CustomerNotFound(Exception):
    pass


@dataclass
class CustomerFilters:
    search: Optional[str] = None
    page: int = 1
    page_size: int = 20


def _order_stats_for_users(db: Session, user_ids: list[uuid.UUID]) -> dict[uuid.UUID, dict]:
    if not user_ids:
        return {}
    rows = db.execute(
        select(
            Order.user_id,
            func.count().label("order_count"),
            func.coalesce(
                func.sum(Order.total_amount).filter(Order.status.notin_(REVENUE_EXCLUDED_STATUSES)), 0
            ).label("total_purchase_value"),
        )
        .where(Order.user_id.in_(user_ids))
        .group_by(Order.user_id)
    ).all()
    return {r.user_id: {"order_count": r.order_count, "total_purchase_value": float(r.total_purchase_value)} for r in rows}


def list_customers(db: Session, filters: CustomerFilters) -> tuple[list[User], dict[uuid.UUID, dict], int]:
    query = select(User).where(User.is_admin.is_(False))
    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.where(or_(User.full_name.ilike(like), User.email.ilike(like), User.phone.ilike(like)))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0

    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    users = list(
        db.scalars(query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    )
    stats = _order_stats_for_users(db, [u.id for u in users])
    return users, stats, total


def get_customer(db: Session, customer_id: uuid.UUID) -> User:
    user = db.get(User, customer_id)
    if user is None or user.is_admin:
        raise CustomerNotFound()
    return user


def get_addresses(db: Session, customer_id: uuid.UUID) -> list[Address]:
    return list(
        db.scalars(select(Address).where(Address.user_id == customer_id).order_by(Address.is_default.desc()))
    )


def get_recent_orders(db: Session, customer_id: uuid.UUID, limit: int = 5) -> list[Order]:
    return list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == customer_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
    )


def get_purchase_history(db: Session, customer_id: uuid.UUID, limit: int = 100) -> list[Order]:
    return list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == customer_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
    )
