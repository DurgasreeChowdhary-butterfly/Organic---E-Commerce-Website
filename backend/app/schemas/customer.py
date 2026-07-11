"""Schemas for admin customer management. Deliberately excludes hashed
passwords, refresh tokens, and payment secrets - only fields needed for the
admin customer list/detail views are surfaced here."""
import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel

from app.schemas.address import AddressRead
from app.schemas.order import AdminOrderListItemRead


class CustomerListItemRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    order_count: int
    total_purchase_value: float


class CustomerListResponse(BaseModel):
    items: List[CustomerListItemRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class CustomerDetailRead(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    order_count: int
    total_purchase_value: float
    addresses: List[AddressRead]
    recent_orders: List[AdminOrderListItemRead]
    purchase_history: List[AdminOrderListItemRead]
