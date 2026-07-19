"""Pydantic schemas for Affiliates and their click/order/commission stats."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.affiliate import AffiliateStatus
from app.schemas.user import UserRead


class AffiliateRegister(BaseModel):
    """Body is empty — the affiliate profile is created for the current
    authenticated user; no fields are client-supplied."""


class AffiliateApply(BaseModel):
    """Public 'Become an Affiliate' submission. When the caller is already
    authenticated (Authorization header present), all of these are ignored
    and the affiliate profile is created for that existing account. When
    the caller is anonymous, full_name/email/phone/password/confirm_password
    are required to create the underlying customer account first."""

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    confirm_password: Optional[str] = None


class AffiliateRead(BaseModel):
    id: uuid.UUID
    affiliate_code: str
    status: AffiliateStatus
    commission_percentage: float
    created_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AffiliateApplyResponse(BaseModel):
    affiliate: AffiliateRead
    # Populated only when a new account was created (anonymous applicant) —
    # lets the frontend log the visitor straight into their new account.
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserRead] = None


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
