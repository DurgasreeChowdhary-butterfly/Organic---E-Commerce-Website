"""Pydantic schemas for Order, order items, status history, and invoices."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.order import OrderStatus
from app.schemas.address import AddressRead
from app.schemas.cart import CartRead


class OrderItemRead(BaseModel):
    id: uuid.UUID
    product_id: Optional[uuid.UUID]
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    gst_percentage: float
    line_gst: float
    line_total: float

    class Config:
        from_attributes = True


class OrderStatusHistoryRead(BaseModel):
    status: OrderStatus
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    subtotal: float
    discount_amount: float
    gst_amount: float
    shipping_fee: float
    total_amount: float
    coupon_code: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    cancel_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    items: List[OrderItemRead]
    address: AddressRead
    status_history: List[OrderStatusHistoryRead]

    class Config:
        from_attributes = True


class OrderListItemRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    total_amount: float
    item_count: int
    created_at: datetime


class OrderListResponse(BaseModel):
    items: List[OrderListItemRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdminOrderListItemRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    total_amount: float
    item_count: int
    created_at: datetime
    customer_name: str
    customer_email: str


class AdminOrderListResponse(BaseModel):
    items: List[AdminOrderListItemRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderStatusUpdateRequest(BaseModel):
    status: OrderStatus
    note: Optional[str] = None


class OrderCancelRequest(BaseModel):
    reason: Optional[str] = None


class OrderRefundRequest(BaseModel):
    reason: Optional[str] = None


class ReorderResponse(BaseModel):
    cart: CartRead
    skipped: List[str]
