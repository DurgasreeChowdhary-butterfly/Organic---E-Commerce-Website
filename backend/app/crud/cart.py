"""CRUD operations for Cart, including stock/availability validation and
subtotal/discount/GST/total calculation.
"""
import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product


class ProductUnavailable(Exception):
    """Raised when a product is inactive and cannot be added to the cart."""


class InsufficientStock(Exception):
    """Raised when the requested quantity exceeds available stock."""

    def __init__(self, available: int):
        self.available = available
        super().__init__(f"Insufficient stock (available: {available})")


class CartItemNotFound(Exception):
    """Raised when a cart item id doesn't belong to the given cart."""


def _with_items(query):
    return query.options(selectinload(Cart.items).selectinload(CartItem.product))


def get_or_create_cart(db: Session, user_id: uuid.UUID) -> Cart:
    cart = db.scalar(_with_items(select(Cart).where(Cart.user_id == user_id)))
    if cart is None:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        cart = db.scalar(_with_items(select(Cart).where(Cart.id == cart.id)))
    return cart


def _validate_for_cart(product: Product, requested_quantity: int) -> None:
    if not product.is_active:
        raise ProductUnavailable("This product is currently unavailable")
    if requested_quantity > product.stock_quantity:
        raise InsufficientStock(product.stock_quantity)


def add_item(db: Session, cart: Cart, product: Product, quantity: int) -> Cart:
    """Add a product to the cart, merging into an existing line if already present."""
    existing = next((i for i in cart.items if i.product_id == product.id), None)
    new_quantity = (existing.quantity if existing else 0) + quantity
    _validate_for_cart(product, new_quantity)

    if existing:
        existing.quantity = new_quantity
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity))
    db.commit()
    return get_or_create_cart(db, cart.user_id)


def update_item_quantity(db: Session, cart: Cart, item_id: uuid.UUID, quantity: int) -> Cart:
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise CartItemNotFound()
    _validate_for_cart(item.product, quantity)
    item.quantity = quantity
    db.commit()
    return get_or_create_cart(db, cart.user_id)


def remove_item(db: Session, cart: Cart, item_id: uuid.UUID) -> Cart:
    item = next((i for i in cart.items if i.id == item_id), None)
    if item is None:
        raise CartItemNotFound()
    db.delete(item)
    db.commit()
    return get_or_create_cart(db, cart.user_id)


def clear_cart(db: Session, cart: Cart) -> Cart:
    for item in list(cart.items):
        db.delete(item)
    db.commit()
    return get_or_create_cart(db, cart.user_id)


def line_values(item: CartItem) -> dict:
    """Per-line price breakdown: MRP subtotal, discount savings, GST, and line total."""
    product = item.product
    unit_price = float(product.price)
    unit_discounted = float(product.discount_price) if product.discount_price is not None else unit_price
    line_subtotal = unit_price * item.quantity
    line_discount = (unit_price - unit_discounted) * item.quantity
    line_gst = round(unit_discounted * item.quantity * float(product.gst_percentage) / 100, 2)
    line_total = round(unit_discounted * item.quantity + line_gst, 2)
    return {
        "line_subtotal": round(line_subtotal, 2),
        "line_discount": round(line_discount, 2),
        "line_gst": line_gst,
        "line_total": line_total,
    }


def summarize(cart: Cart) -> dict:
    """Cart-level subtotal/discount/GST/total, summed from each line."""
    subtotal = discount = gst = total = 0.0
    for item in cart.items:
        values = line_values(item)
        subtotal += values["line_subtotal"]
        discount += values["line_discount"]
        gst += values["line_gst"]
        total += values["line_total"]
    return {
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "gst": round(gst, 2),
        "total": round(total, 2),
    }
