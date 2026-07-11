"""Aggregation queries for admin dashboard analytics.

Revenue figures exclude REFUNDED orders (money given back is not revenue).
Cancelled-but-not-refunded orders still count as revenue since, in this
app's flow, an order only exists after payment already succeeded — a
cancellation alone doesn't reverse the charge, only a separate refund does.
"""
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.crud import inventory as inventory_crud
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User

REVENUE_EXCLUDED_STATUSES = (OrderStatus.REFUNDED,)
SALES_EXCLUDED_STATUSES = (OrderStatus.CANCELLED, OrderStatus.REFUNDED)


def get_stats(db: Session) -> dict:
    total_revenue = (
        db.scalar(select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.status.notin_(REVENUE_EXCLUDED_STATUSES)))
        or 0
    )
    total_orders = db.scalar(select(func.count()).select_from(Order)) or 0
    total_customers = db.scalar(select(func.count()).select_from(User).where(User.is_admin.is_(False))) or 0
    total_products = db.scalar(select(func.count()).select_from(Product)) or 0
    pending_orders = db.scalar(select(func.count()).select_from(Order).where(Order.status == OrderStatus.PENDING)) or 0
    delivered_orders = db.scalar(select(func.count()).select_from(Order).where(Order.status == OrderStatus.DELIVERED)) or 0
    cancelled_orders = db.scalar(select(func.count()).select_from(Order).where(Order.status == OrderStatus.CANCELLED)) or 0

    return {
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_products": total_products,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "cancelled_orders": cancelled_orders,
        "low_stock_products": inventory_crud.count_low_stock(db),
        "out_of_stock_products": inventory_crud.count_out_of_stock(db),
    }


def get_recent_orders(db: Session, limit: int = 5) -> list[Order]:
    return list(
        db.scalars(
            select(Order).options(selectinload(Order.user)).order_by(Order.created_at.desc()).limit(limit)
        )
    )


def get_top_selling_products(db: Session, limit: int = 5) -> list[dict]:
    rows = db.execute(
        select(
            OrderItem.product_id,
            OrderItem.product_name,
            OrderItem.sku,
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(OrderItem.line_total).label("revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status.notin_(SALES_EXCLUDED_STATUSES))
        .group_by(OrderItem.product_id, OrderItem.product_name, OrderItem.sku)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(limit)
    ).all()
    return [
        {
            "product_id": r.product_id,
            "name": r.product_name,
            "sku": r.sku,
            "quantity_sold": int(r.quantity_sold),
            "revenue": float(r.revenue),
        }
        for r in rows
    ]


def get_sales_trend(db: Session, days: int = 7) -> list[dict]:
    start_date = datetime.utcnow().date() - timedelta(days=days - 1)
    rows = db.execute(
        select(
            func.date(Order.created_at).label("day"),
            func.sum(Order.total_amount).label("revenue"),
            func.count().label("order_count"),
        )
        .where(Order.status.notin_(REVENUE_EXCLUDED_STATUSES), func.date(Order.created_at) >= start_date)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    ).all()

    by_day: dict[date, tuple[float, int]] = {r.day: (float(r.revenue), r.order_count) for r in rows}
    trend = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        revenue, order_count = by_day.get(day, (0.0, 0))
        trend.append({"date": day, "revenue": revenue, "order_count": order_count})
    return trend
