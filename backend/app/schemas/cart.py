"""Pydantic schemas for Cart."""
import uuid
from typing import List

from pydantic import BaseModel, Field

from app.schemas.product import ProductRead


class CartItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead
    quantity: int
    line_subtotal: float
    line_discount: float
    line_gst: float
    line_total: float


class CartRead(BaseModel):
    items: List[CartItemRead]
    item_count: int
    subtotal: float
    discount: float
    gst: float
    total: float
