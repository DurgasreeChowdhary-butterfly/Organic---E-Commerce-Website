"""Pydantic schemas for Cart."""
import uuid
from pydantic import BaseModel


class CartItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemRead(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int

    class Config:
        from_attributes = True
