"""
Checkout, order history, status, and invoice endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.order import CheckoutRequest, OrderRead

router = APIRouter()


@router.post("/checkout", response_model=OrderRead)
def checkout(payload: CheckoutRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Create an order from the current cart, apply coupon + GST. TODO: implement."""
    raise NotImplementedError


@router.get("/", response_model=List[OrderRead])
def list_my_orders(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """List the current user's order history. TODO: implement."""
    raise NotImplementedError


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a single order with status and items. TODO: implement."""
    raise NotImplementedError


@router.get("/{order_id}/invoice")
def download_invoice(order_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Generate/download a GST invoice PDF. TODO: implement."""
    raise NotImplementedError
