"""Pydantic schemas for Affiliates and their click/order/commission stats."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.affiliate import AffiliateStatus


class AffiliateRegister(BaseModel):
    """Body is empty — the affiliate profile is created for the current
    authenticated user; no fields are client-supplied."""


class AffiliateRead(BaseModel):
    id: uuid.UUID
    affiliate_code: str
    status: AffiliateStatus
    commission_percentage: float
    created_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AffiliateAdminRead(AffiliateRead):
    """Admin list/detail view — includes the identifying user info the
    affiliate's own dashboard never exposes about *itself* (it's their own
    data), kept separate from AffiliateRead to make clear customer-facing
    responses never carry other users' PII."""

    user_id: uuid.UUID
    full_name: str
    email: str

    class Config:
        from_attributes = True


class AffiliateListResponse(BaseModel):
    items: List[AffiliateAdminRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class AffiliateCommissionUpdate(BaseModel):
    commission_percentage: float = Field(gt=0, le=100)


class AffiliateDashboard(BaseModel):
    affiliate_code: str
    status: AffiliateStatus
    commission_percentage: float
    total_clicks: int
    total_orders: int
    total_sales: float
    commission_pending: float
    commission_earned: float
    commission_paid: float


class AttributedOrderSummary(BaseModel):
    order_id: uuid.UUID
    order_number: str
    order_status: str
    total_amount: float
    commission_status: str
    commission_amount: float
    created_at: datetime

    class Config:
        from_attributes = True
