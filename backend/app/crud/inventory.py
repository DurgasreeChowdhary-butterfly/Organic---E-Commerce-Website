"""CRUD for inventory transactions (stock movements) and admin inventory views.

`adjust_stock` is the single choke point for every stock mutation in the
app — nothing should ever assign to `Product.stock_quantity` directly.
"""
import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.inventory import InventoryTransaction, MovementType
from app.models.product import Category, Product


class InsufficientStockForAdjustment(Exception):
    def __init__(self, available: int, requested_change: int):
        self.available = available
        self.requested_change = requested_change
        super().__init__(
            f"This adjustment would take stock negative (available: {available}, change: {requested_change})"
        )


def adjust_stock(
    db: Session,
    product: Product,
    movement_type: MovementType,
    quantity_change: int,
    *,
    reason: Optional[str] = None,
    order_id: Optional[uuid.UUID] = None,
    admin_id: Optional[uuid.UUID] = None,
    commit: bool = True,
) -> Product:
    """Locks the product row, applies `quantity_change`, guards against
    negative stock, and writes an InventoryTransaction — all atomically.
    Row locking (`with_for_update`) serializes concurrent adjustments to the
    same product (e.g. two near-simultaneous orders for the last unit),
    closing the race window that would otherwise allow overselling.
    """
    locked_product = db.execute(
        select(Product).where(Product.id == product.id).with_for_update()
    ).scalar_one()

    stock_before = locked_product.stock_quantity
    stock_after = stock_before + quantity_change
    if stock_after < 0:
        raise InsufficientStockForAdjustment(stock_before, quantity_change)

    locked_product.stock_quantity = stock_after
    db.add(
        InventoryTransaction(
            product_id=locked_product.id,
            movement_type=movement_type,
            quantity_change=quantity_change,
            stock_before=stock_before,
            stock_after=stock_after,
            reason=reason,
            order_id=order_id,
            admin_id=admin_id,
        )
    )
    if commit:
        db.commit()
        db.refresh(locked_product)
    return locked_product


def increase_stock(db: Session, product: Product, quantity: int, reason: str, admin_id: uuid.UUID) -> Product:
    return adjust_stock(db, product, MovementType.MANUAL_INCREASE, quantity, reason=reason, admin_id=admin_id)


def decrease_stock(db: Session, product: Product, quantity: int, reason: str, admin_id: uuid.UUID) -> Product:
    return adjust_stock(db, product, MovementType.MANUAL_DECREASE, -quantity, reason=reason, admin_id=admin_id)


def correct_stock(db: Session, product: Product, new_quantity: int, reason: str, admin_id: uuid.UUID) -> Product:
    delta = new_quantity - product.stock_quantity
    return adjust_stock(db, product, MovementType.CORRECTION, delta, reason=reason, admin_id=admin_id)


@dataclass
class InventoryFilters:
    search: Optional[str] = None
    category_slug: Optional[str] = None
    stock_status: Optional[str] = None  # "in_stock" | "low_stock" | "out_of_stock"
    page: int = 1
    page_size: int = 20


def list_inventory(db: Session, filters: InventoryFilters):
    """Returns (rows, total) where each row is (Product, last_updated)."""
    last_updated_subq = (
        select(func.max(InventoryTransaction.created_at))
        .where(InventoryTransaction.product_id == Product.id)
        .correlate(Product)
        .scalar_subquery()
    )

    query = select(Product, last_updated_subq).join(Category).where(Product.is_active.is_(True))

    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.where(or_(Product.name.ilike(like), Product.sku.ilike(like)))
    if filters.category_slug:
        query = query.where(Category.slug == filters.category_slug)
    if filters.stock_status == "out_of_stock":
        query = query.where(Product.stock_quantity == 0)
    elif filters.stock_status == "low_stock":
        query = query.where(Product.stock_quantity > 0, Product.stock_quantity <= Product.low_stock_threshold)
    elif filters.stock_status == "in_stock":
        query = query.where(Product.stock_quantity > Product.low_stock_threshold)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)
    rows = db.execute(
        query.options(selectinload(Product.category))
        .order_by(Product.name.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return rows, total


def list_transactions(db: Session, product_id: uuid.UUID, page: int = 1, page_size: int = 20):
    base = select(InventoryTransaction).where(InventoryTransaction.product_id == product_id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    page = max(page, 1)
    page_size = max(min(page_size, 100), 1)
    items = list(
        db.execute(
            base.options(selectinload(InventoryTransaction.order), selectinload(InventoryTransaction.admin))
            .order_by(InventoryTransaction.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )
    return items, total


def count_low_stock(db: Session) -> int:
    return (
        db.scalar(
            select(func.count()).select_from(Product).where(
                Product.is_active.is_(True),
                Product.stock_quantity > 0,
                Product.stock_quantity <= Product.low_stock_threshold,
            )
        )
        or 0
    )


def count_out_of_stock(db: Session) -> int:
    return (
        db.scalar(
            select(func.count()).select_from(Product).where(Product.is_active.is_(True), Product.stock_quantity == 0)
        )
        or 0
    )


def list_low_stock_products(db: Session, limit: int = 10) -> list[Product]:
    return list(
        db.scalars(
            select(Product)
            .where(Product.is_active.is_(True), Product.stock_quantity <= Product.low_stock_threshold)
            .order_by(Product.stock_quantity.asc())
            .limit(limit)
        )
    )
