"""Pydantic schemas for Wishlist."""
import uuid
from typing import List

from pydantic import BaseModel

from app.schemas.cart import CartRead
from app.schemas.product import ProductRead


class WishlistItemRead(BaseModel):
    id: uuid.UUID
    product: ProductRead


class WishlistRead(BaseModel):
    items: List[WishlistItemRead]
    count: int


class MoveToCartResponse(BaseModel):
    cart: CartRead
    wishlist: WishlistRead
