"""Pydantic schemas for admin dashboard analytics."""
import uuid
from datetime import date as date_type, datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.order import OrderStatus


class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    pending_orders: int
    delivered_orders: int
    cancelled_orders: int
    low_stock_products: int
    out_of_stock_products: int


class RecentOrderRead(BaseModel):
    id: uuid.UUID
    order_number: str
    status: OrderStatus
    total_amount: float
    created_at: datetime
    customer_name: str


class TopSellingProductRead(BaseModel):
    product_id: Optional[uuid.UUID] = None
    name: str
    sku: str
    quantity_sold: int
    revenue: float


class LowStockAlertRead(BaseModel):
    id: uuid.UUID
    name: str
    sku: str
    stock_quantity: int
    low_stock_threshold: int


class SalesTrendPoint(BaseModel):
    date: date_type
    revenue: float
    order_count: int


class DashboardAnalyticsResponse(BaseModel):
    stats: DashboardStats
    recent_orders: List[RecentOrderRead]
    top_selling_products: List[TopSellingProductRead]
    low_stock_alerts: List[LowStockAlertRead]
    sales_trend: List[SalesTrendPoint]
