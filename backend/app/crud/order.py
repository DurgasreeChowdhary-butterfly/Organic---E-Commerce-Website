"""CRUD operations for Order/OrderItem/OrderStatusHistory."""
import random
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.crud import cart as cart_crud
from app.crud import payment as payment_crud
from app.models.cart import Cart
from app.models.order import Order, OrderItem, OrderStatus, OrderStatusHistory
from app.models.payment import Payment
from app.models.product import Product
from app.models.user import User

# Orders can only be customer-cancelled before they've shipped.
CANCELLABLE_STATUSES = {OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PACKED}
# Once cancelled or refunded, an order's status is final.
TERMINAL_STATUSES = {OrderStatus.CANCELLED, OrderStatus.REFUNDED}


class OrderNotFound(Exception):
    pass


class OrderCannotBeCancelled(Exception):
    def __init__(self):
        super().__init__("This order can no longer be cancelled — it has already shipped or been finalized")


class OrderStatusIsFinal(Exception):
    def __init__(self, status: OrderStatus):
        super().__init__(f"This order is already {status.value} and cannot be changed further")


class OrderNotRefundable(Exception):
    def __init__(self):
        super().__init__("This order has no associated payment to refund")


def _with_relations(query):
    return query.options(
        selectinload(Order.items),
        selectinload(Order.status_history),
        selectinload(Order.address),
        selectinload(Order.coupon),
        selectinload(Order.user),
    )


def _generate_order_number(db: Session) -> str:
    while True:
        candidate = f"PRK-{random.randint(100000, 999999)}"
        if db.scalar(select(Order.id).where(Order.order_number == candidate)) is None:
            return candidate


def get(db: Session, order_id: uuid.UUID) -> Order:
    order = db.scalar(_with_relations(select(Order).where(Order.id == order_id)))
    if order is None:
        raise OrderNotFound()
    return order


def get_for_user(db: Session, user_id: uuid.UUID, order_id: uuid.UUID) -> Order:
    order = db.scalar(_with_relations(select(Order).where(Order.id == order_id, Order.user_id == user_id)))
    if order is None:
        raise OrderNotFound()
    return order


def list_for_user(db: Session, user_id: uuid.UUID, page: int = 1, page_size: int = 10) -> tuple[list[Order], int]:
    base = select(Order).where(Order.user_id == user_id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
    items = list(
        db.execute(
            base.options(selectinload(Order.items)).order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


@dataclass
class OrderFilters:
    search: Optional[str] = None
    status: Optional[OrderStatus] = None
    page: int = 1
    page_size: int = 20


def list_admin(db: Session, filters: OrderFilters) -> tuple[list[Order], int]:
    query = select(Order)
    if filters.status is not None:
        query = query.where(Order.status == filters.status)
    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.join(User, User.id == Order.user_id).where(
            or_(Order.order_number.ilike(like), User.email.ilike(like), User.full_name.ilike(like))
        )

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    items = list(
        db.execute(
            _with_relations(query).order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def create_from_payment(db: Session, payment: Payment) -> Order:
    """Create an Order (with items + initial status history) from a
    successfully-verified Payment, decrementing stock for each item. Called
    only from the payment verification flow, once, per payment."""
    order = Order(
        order_number=_generate_order_number(db),
        user_id=payment.user_id,
        address_id=payment.address_id,
        payment_id=payment.id,
        status=OrderStatus.CONFIRMED,
        subtotal=payment.subtotal,
        gst_amount=payment.gst_amount,
        discount_amount=payment.discount_amount,
        shipping_fee=payment.shipping_fee,
        total_amount=payment.amount,
        coupon_id=payment.coupon_id,
        razorpay_order_id=payment.razorpay_order_id,
        razorpay_payment_id=payment.razorpay_payment_id,
    )
    db.add(order)
    db.flush()

    for line in payment.cart_snapshot:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=uuid.UUID(line["product_id"]) if line.get("product_id") else None,
                product_name=line["name"],
                sku=line["sku"],
                quantity=line["quantity"],
                unit_price=line["unit_price"],
                gst_percentage=line["gst_percentage"],
                line_gst=line["line_gst"],
                line_total=line["line_total"],
            )
        )
        if line.get("product_id"):
            product = db.get(Product, uuid.UUID(line["product_id"]))
            if product is not None:
                product.stock_quantity = max(0, product.stock_quantity - line["quantity"])

    db.add(OrderStatusHistory(order_id=order.id, status=OrderStatus.CONFIRMED, note="Order confirmed after successful payment"))
    db.commit()
    return get(db, order.id)


def update_status(db: Session, order: Order, new_status: OrderStatus, note: Optional[str] = None) -> Order:
    if order.status in TERMINAL_STATUSES:
        raise OrderStatusIsFinal(order.status)
    order.status = new_status
    db.add(OrderStatusHistory(order_id=order.id, status=new_status, note=note))
    db.commit()
    return get(db, order.id)


def cancel(db: Session, order: Order, reason: Optional[str] = None) -> Order:
    if order.status not in CANCELLABLE_STATUSES:
        raise OrderCannotBeCancelled()

    for item in order.items:
        if item.product_id:
            product = db.get(Product, item.product_id)
            if product is not None:
                product.stock_quantity += item.quantity

    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.utcnow()
    order.cancel_reason = reason
    db.add(OrderStatusHistory(order_id=order.id, status=OrderStatus.CANCELLED, note=reason or "Cancelled"))
    db.commit()
    return get(db, order.id)


def refund(db: Session, order: Order, reason: Optional[str] = None) -> Order:
    if not order.razorpay_payment_id:
        raise OrderNotRefundable()
    if order.status == OrderStatus.REFUNDED:
        raise OrderStatusIsFinal(order.status)

    refund_result = payment_crud.create_refund(order.razorpay_payment_id, float(order.total_amount))

    order.status = OrderStatus.REFUNDED
    order.refund_id = refund_result.get("id")
    order.refunded_at = datetime.utcnow()
    db.add(OrderStatusHistory(order_id=order.id, status=OrderStatus.REFUNDED, note=reason or "Refunded"))
    db.commit()
    return get(db, order.id)


def reorder(db: Session, order: Order, user_id: uuid.UUID) -> tuple[Cart, list[str]]:
    """Add each item from a past order back into the user's current cart,
    skipping products that no longer exist, are inactive, or are out of stock."""
    cart = cart_crud.get_or_create_cart(db, user_id)
    skipped: list[str] = []

    for item in order.items:
        product = db.get(Product, item.product_id) if item.product_id else None
        if product is None or not product.is_active or product.stock_quantity < 1:
            skipped.append(item.product_name)
            continue
        try:
            cart = cart_crud.add_item(db, cart, product, min(item.quantity, product.stock_quantity))
        except (cart_crud.ProductUnavailable, cart_crud.InsufficientStock):
            skipped.append(item.product_name)

    return cart, skipped
