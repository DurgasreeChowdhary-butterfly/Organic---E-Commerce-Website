"""Pydantic schemas for the admin-facing Commission views."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.commission import CommissionSource, CommissionStatus


class CommissionRead(BaseModel):
    id: uuid.UUID
    source: CommissionSource
    affiliate_id: Optional[uuid.UUID] = None
    coupon_id: Optional[uuid.UUID] = None
    order_id: uuid.UUID
    order_number: str
    percentage_applied: float
    amount: float
    status: CommissionStatus
    created_at: datetime
    earned_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    reversed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CommissionListResponse(BaseModel):
    items: List[CommissionRead]
    total: int
    page: int
    page_size: int
    total_pages: int
