"""Checkout summary computation: layers an optional coupon discount and a
flat shipping rule on top of the cart's existing subtotal/discount/GST math.
"""
import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy.orm import Session

from app.crud import cart as cart_crud
from app.crud import coupon as coupon_crud
from app.models.cart import Cart
from app.models.coupon import Coupon

FREE_SHIPPING_THRESHOLD = 499.0
SHIPPING_FEE = 59.0


def compute_shipping(order_value: float) -> float:
    return 0.0 if order_value > FREE_SHIPPING_THRESHOLD else SHIPPING_FEE


@dataclass
class CheckoutSummary:
    subtotal: float
    product_discount: float
    coupon_discount: float
    discount: float
    gst: float
    shipping: float
    total: float
    coupon: Optional[Coupon] = None


def compute_summary(db: Session, cart: Cart, user_id: uuid.UUID, coupon_code: Optional[str] = None) -> CheckoutSummary:
    """Raises coupon_crud.CouponError/CouponNotFound if `coupon_code` is given and invalid."""
    cart_totals = cart_crud.summarize(cart)
    order_value = cart_totals["subtotal"] - cart_totals["discount"]

    coupon = None
    coupon_discount = 0.0
    if coupon_code:
        coupon = coupon_crud.validate_for_order(db, coupon_code, user_id, order_value)
        coupon_discount = coupon_crud.compute_discount(coupon, order_value)

    shipping = compute_shipping(order_value - coupon_discount)
    discount = round(cart_totals["discount"] + coupon_discount, 2)
    total = round(order_value - coupon_discount + cart_totals["gst"] + shipping, 2)

    return CheckoutSummary(
        subtotal=cart_totals["subtotal"],
        product_discount=cart_totals["discount"],
        coupon_discount=coupon_discount,
        discount=discount,
        gst=cart_totals["gst"],
        shipping=shipping,
        total=total,
        coupon=coupon,
    )
