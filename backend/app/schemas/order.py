"""Pydantic schemas for Order and checkout."""
import uuid
from typing import Optional
from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    address_id: uuid.UUID
    coupon_code: Optional[str] = None


class OrderRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: str
    total_amount: float

    class Config:
        from_attributes = True
