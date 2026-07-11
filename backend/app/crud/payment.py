"""CRUD + Razorpay SDK integration for Payment/Transaction records."""
import uuid
from typing import Optional

import razorpay
from razorpay.errors import SignatureVerificationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.payment import Payment, PaymentStatus


class PaymentNotFound(Exception):
    pass


class PaymentAlreadyProcessed(Exception):
    def __init__(self, status: str):
        self.status = status
        super().__init__(f"This payment has already been {status}")


class OrderIdMismatch(Exception):
    pass


class RazorpayOrderCreationFailed(Exception):
    pass


class RazorpayRefundFailed(Exception):
    pass


def _client() -> razorpay.Client:
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(amount_rupees: float, receipt: str) -> dict:
    """Calls Razorpay's Orders API. Raises RazorpayOrderCreationFailed on any SDK/network error."""
    amount_paise = int(round(amount_rupees * 100))
    try:
        client = _client()
        return client.order.create(
            {"amount": amount_paise, "currency": "INR", "receipt": receipt, "payment_capture": 1}
        )
    except Exception as exc:  # noqa: BLE001 — surface any SDK/network failure uniformly
        raise RazorpayOrderCreationFailed(str(exc)) from exc


def create_refund(razorpay_payment_id: str, amount_rupees: float) -> dict:
    """Calls Razorpay's Refunds API. Raises RazorpayRefundFailed on any SDK/network error."""
    amount_paise = int(round(amount_rupees * 100))
    try:
        client = _client()
        return client.payment.refund(razorpay_payment_id, {"amount": amount_paise})
    except Exception as exc:  # noqa: BLE001 — surface any SDK/network failure uniformly
        raise RazorpayRefundFailed(str(exc)) from exc


def verify_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    try:
        client = _client()
        return client.utility.verify_payment_signature(
            {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            }
        )
    except SignatureVerificationError:
        return False


def get(db: Session, payment_id: uuid.UUID) -> Payment:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise PaymentNotFound()
    return payment


def get_for_user(db: Session, payment_id: uuid.UUID, user_id: uuid.UUID) -> Payment:
    payment = get(db, payment_id)
    if payment.user_id != user_id:
        raise PaymentNotFound()
    return payment


def create(
    db: Session,
    *,
    user_id: uuid.UUID,
    address_id: uuid.UUID,
    coupon_id: Optional[uuid.UUID],
    razorpay_order_id: str,
    subtotal: float,
    discount_amount: float,
    gst_amount: float,
    shipping_fee: float,
    amount: float,
    cart_snapshot: list,
) -> Payment:
    payment = Payment(
        user_id=user_id,
        address_id=address_id,
        coupon_id=coupon_id,
        razorpay_order_id=razorpay_order_id,
        subtotal=subtotal,
        discount_amount=discount_amount,
        gst_amount=gst_amount,
        shipping_fee=shipping_fee,
        amount=amount,
        cart_snapshot=cart_snapshot,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def mark_success(db: Session, payment: Payment, razorpay_payment_id: str, razorpay_signature: str) -> Payment:
    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = PaymentStatus.SUCCESS
    db.commit()
    db.refresh(payment)
    return payment


def mark_failed(db: Session, payment: Payment, reason: Optional[str] = None) -> Payment:
    payment.status = PaymentStatus.FAILED
    payment.failure_reason = reason
    db.commit()
    db.refresh(payment)
    return payment
