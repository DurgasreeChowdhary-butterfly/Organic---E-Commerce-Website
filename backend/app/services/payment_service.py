"""
Razorpay integration service.
TODO: implement order creation, signature verification, webhook handling, refunds.
"""
import razorpay
from app.core.config import settings

# client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount_paise: int, receipt: str):
    raise NotImplementedError


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    raise NotImplementedError


def process_webhook_event(payload: dict) -> None:
    raise NotImplementedError
