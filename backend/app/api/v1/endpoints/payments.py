"""
Razorpay payment gateway integration endpoints.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/razorpay/create-order")
def create_razorpay_order(order_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a Razorpay order for the given internal order. TODO: implement."""
    raise NotImplementedError


@router.post("/razorpay/verify")
def verify_razorpay_payment(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Verify payment signature after checkout. TODO: implement."""
    raise NotImplementedError


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle async Razorpay webhook events (payment captured/failed/refunded). TODO: implement."""
    raise NotImplementedError
