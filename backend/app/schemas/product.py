"""Pydantic schemas for Product and Category."""
import uuid
from typing import Optional
from pydantic import BaseModel


class CategoryRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    category_id: uuid.UUID
    name: str
    description: str
    price: float
    discount_price: Optional[float] = None
    stock_quantity: int
    gst_percentage: float = 5.0


class ProductRead(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    price: float
    discount_price: Optional[float] = None
    stock_quantity: int
    is_best_seller: bool
    is_new_arrival: bool

    class Config:
        from_attributes = True
