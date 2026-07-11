"""Pydantic schemas for inventory transactions and admin stock management."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.inventory import MovementType


class InventoryTransactionRead(BaseModel):
    id: uuid.UUID
    movement_type: MovementType
    quantity_change: int
    stock_before: int
    stock_after: int
    reason: Optional[str] = None
    order_id: Optional[uuid.UUID] = None
    order_number: Optional[str] = None
    admin_name: Optional[str] = None
    created_at: datetime


class InventoryTransactionListResponse(BaseModel):
    items: List[InventoryTransactionRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class InventoryItemRead(BaseModel):
    id: uuid.UUID
    name: str
    sku: str
    category_name: str
    stock_quantity: int
    low_stock_threshold: int
    stock_status: str
    last_updated: datetime


class InventoryListResponse(BaseModel):
    items: List[InventoryItemRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class StockAdjustmentRequest(BaseModel):
    quantity: int = Field(gt=0)
    reason: str = Field(min_length=3, max_length=255)


class StockCorrectionRequest(BaseModel):
    new_quantity: int = Field(ge=0)
    reason: str = Field(min_length=3, max_length=255)
