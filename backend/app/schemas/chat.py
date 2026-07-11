"""Request/response schemas for the AI Assistant chat endpoint."""
import uuid
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=1000)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty.")
        return stripped


class ProductSuggestion(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    price: Decimal
    discount_price: Optional[Decimal] = None
    image_url: Optional[str] = None
    in_stock: bool


class ChatResponse(BaseModel):
    reply: str
    suggested_products: list[ProductSuggestion] = []
    escalate_to_whatsapp: bool = False
