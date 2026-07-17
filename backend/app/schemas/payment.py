"""Pydantic schemas for Razorpay order creation and payment verification."""
import uuid
from typing import Optional

from pydantic import BaseModel


class CreateRazorpayOrderRequest(BaseModel):
    address_id: uuid.UUID
    coupon_code: Optional[str] = None
    # Affiliate referral captured client-side from `?ref=CODE` (see
    # useAffiliateTracking on the frontend). `affiliate_ref_ts` is the epoch
    # milliseconds of the original click, used only to re-check the
    # attribution window server-side — the affiliate's status and code are
    # independently re-validated regardless of what's sent here.
    affiliate_ref: Optional[str] = None
    affiliate_ref_ts: Optional[int] = None


class CreateRazorpayOrderResponse(BaseModel):
    payment_id: uuid.UUID
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int
    currency: str
    subtotal: float
    discount: float
    gst: float
    shipping: float
    total: float


class VerifyPaymentRequest(BaseModel):
    payment_id: uuid.UUID
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    status: str
    payment_id: uuid.UUID
    razorpay_payment_id: str
    amount: float
    order_id: uuid.UUID
    order_number: str


class PaymentFailureRequest(BaseModel):
    payment_id: uuid.UUID
    reason: Optional[str] = None
