"""Pydantic schemas for Product and Category."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- Category ----------

class CategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryRead(CategoryBase):
    id: uuid.UUID
    slug: str
    product_count: int = 0

    class Config:
        from_attributes = True


# ---------- Product Image ----------

class ProductImageRead(BaseModel):
    id: uuid.UUID
    image_url: str
    is_primary: bool
    sort_order: int

    class Config:
        from_attributes = True


# ---------- Product ----------

class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=1)
    price: float = Field(gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    gst_percentage: float = Field(default=5.0, ge=0, le=100)
    sku: str = Field(min_length=1, max_length=50)
    category_id: uuid.UUID
    stock_quantity: int = Field(ge=0)
    is_active: bool = True
    is_featured: bool = False


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    discount_price: Optional[float] = Field(default=None, gt=0)
    gst_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=50)
    category_id: Optional[uuid.UUID] = None
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductRead(ProductBase):
    id: uuid.UUID
    slug: str
    is_best_seller: bool
    is_new_arrival: bool
    is_seasonal: bool
    created_at: datetime
    category: CategoryRead
    images: List[ProductImageRead] = []

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductRead]
    total: int
    page: int
    page_size: int
    total_pages: int
