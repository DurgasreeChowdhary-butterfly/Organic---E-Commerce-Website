"""
Razorpay payment gateway integration endpoints.

Create a Razorpay order for the current cart + address + optional coupon,
verify the signature Razorpay returns after checkout, and record
success/failure. An Order is created automatically — and only — once a
payment is verified successful; the cart is cleared and the coupon (if any)
is redeemed at the same time. A failed/forged verification leaves the cart,
coupon, and order history untouched.
"""
import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import address as address_crud
from app.crud import affiliate as affiliate_crud
from app.crud import cart as cart_crud
from app.crud import checkout as checkout_crud
from app.crud import commission as commission_crud
from app.crud import coupon as coupon_crud
from app.crud import inventory as inventory_crud
from app.crud import order as order_crud
from app.crud import payment as payment_crud
from app.core.config import settings
from app.db.session import get_db
from app.models.payment import PaymentStatus
from app.models.user import User
from app.schemas.payment import (
    CreateRazorpayOrderRequest,
    CreateRazorpayOrderResponse,
    PaymentFailureRequest,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/razorpay/create-order", response_model=CreateRazorpayOrderResponse)
def create_razorpay_order(
    payload: CreateRazorpayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Validate the cart/address/coupon, create a Razorpay order for the
    computed total, and persist a pending Payment record to verify against."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    if not cart.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your cart is empty")

    for item in cart.items:
        if not item.product.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{item.product.name} is no longer available")
        if item.quantity > item.product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {item.product.stock_quantity} left in stock for {item.product.name}",
            )

    try:
        address = address_crud.get_for_user(db, current_user.id, payload.address_id)
    except address_crud.AddressNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    try:
        summary = checkout_crud.compute_summary(db, cart, current_user.id, payload.coupon_code)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid coupon code")
    except coupon_crud.CouponError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    cart_snapshot = [
        {
            "product_id": str(item.product.id),
            "name": item.product.name,
            "sku": item.product.sku,
            "quantity": item.quantity,
            "unit_price": float(item.product.discount_price or item.product.price),
            "gst_percentage": float(item.product.gst_percentage),
            **cart_crud.line_values(item),
        }
        for item in cart.items
    ]

    receipt = f"rcpt_{uuid.uuid4().hex[:20]}"
    try:
        razorpay_order = payment_crud.create_razorpay_order(summary.total, receipt)
    except payment_crud.RazorpayOrderCreationFailed:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach the payment gateway. Please try again."
        )

    # Backend-authoritative re-validation of the client-supplied affiliate
    # ref: the code must belong to an approved affiliate and the original
    # click must still be within the configured attribution window. An
    # unknown/expired/blocked code is silently dropped rather than erroring
    # the checkout — attribution is best-effort, never a hard requirement.
    affiliate_id = None
    if payload.affiliate_ref:
        affiliate = affiliate_crud.get_by_code(db, payload.affiliate_ref)
        if affiliate is not None:
            click_ts = (
                datetime.utcfromtimestamp(payload.affiliate_ref_ts / 1000) if payload.affiliate_ref_ts else None
            )
            if affiliate_crud.is_attribution_eligible(affiliate, click_ts):
                affiliate_id = affiliate.id

    payment = payment_crud.create(
        db,
        user_id=current_user.id,
        address_id=address.id,
        coupon_id=summary.coupon.id if summary.coupon else None,
        razorpay_order_id=razorpay_order["id"],
        subtotal=summary.subtotal,
        discount_amount=summary.discount,
        gst_amount=summary.gst,
        shipping_fee=summary.shipping,
        amount=summary.total,
        cart_snapshot=cart_snapshot,
        affiliate_id=affiliate_id,
    )

    return CreateRazorpayOrderResponse(
        payment_id=payment.id,
        razorpay_order_id=razorpay_order["id"],
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
        amount=razorpay_order["amount"],
        currency=razorpay_order["currency"],
        subtotal=summary.subtotal,
        discount=summary.discount,
        gst=summary.gst,
        shipping=summary.shipping,
        total=summary.total,
    )


@router.post("/razorpay/verify", response_model=VerifyPaymentResponse)
def verify_razorpay_payment(
    payload: VerifyPaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Verify the payment signature Razorpay Checkout returns after a
    successful payment. Only on success do we redeem the coupon and clear
    the cart — a failed/forged verification leaves both untouched."""
    try:
        payment = payment_crud.get_for_user(db, payload.payment_id, current_user.id)
    except payment_crud.PaymentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if payment.status != PaymentStatus.CREATED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"This payment has already been {payment.status.value}")

    if payment.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order mismatch")

    if not payment_crud.verify_signature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature):
        payment_crud.mark_failed(db, payment, reason="Signature verification failed")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed")

    payment = payment_crud.mark_success(db, payment, payload.razorpay_payment_id, payload.razorpay_signature)

    if payment.coupon_id:
        redeemed = coupon_crud.redeem_if_valid(
            db, payment.coupon_id, current_user.id, payment.id, float(payment.subtotal)
        )
        if not redeemed:
            # Payment is already captured — the order must still be created —
            # but a concurrent checkout exhausted the coupon's usage limit (or
            # it was deactivated/expired) between create-order and verify.
            # Skip the redemption record rather than over-crediting usage.
            logger.warning(
                "Coupon %s no longer valid at payment verification for payment %s; "
                "order will still be created without a redemption record.",
                payment.coupon_id, payment.id,
            )

    try:
        order = order_crud.create_from_payment(db, payment)
    except inventory_crud.InsufficientStockForAdjustment:
        # Extremely rare: stock ran out in the window between create-order's
        # validation and payment verification. The payment has already been
        # captured and is recorded as SUCCESS; this needs manual admin
        # reconciliation (refund or restock) rather than a silent failure.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Payment succeeded but one or more items sold out before your order could be confirmed. Our team will contact you to resolve this.",
        )

    # Attribute the order to an influencer coupon or affiliate referral (in
    # that priority order) — see crud/commission.py attribute_order.
    commission_crud.attribute_order(db, payment, order)

    cart = cart_crud.get_or_create_cart(db, current_user.id)
    cart_crud.clear_cart(db, cart)

    return VerifyPaymentResponse(
        status="success",
        payment_id=payment.id,
        razorpay_payment_id=payment.razorpay_payment_id,
        amount=float(payment.amount),
        order_id=order.id,
        order_number=order.order_number,
    )


@router.post("/razorpay/failure")
def report_payment_failure(
    payload: PaymentFailureRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Client-side reporting hook for a failed/cancelled Razorpay checkout
    (no signature is available in this case — the payment simply never
    completed). Marks the pending Payment row as failed for audit purposes."""
    try:
        payment = payment_crud.get_for_user(db, payload.payment_id, current_user.id)
    except payment_crud.PaymentNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    if payment.status == PaymentStatus.CREATED:
        payment_crud.mark_failed(db, payment, reason=payload.reason or "Payment cancelled or failed on checkout")
    return {"status": "acknowledged"}


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle async Razorpay webhook events (payment captured/failed/refunded). TODO: implement."""
    raise NotImplementedError
