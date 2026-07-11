"""Pydantic schemas for Coupons."""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.coupon import DiscountType


class CouponBase(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    discount_type: DiscountType
    discount_value: float = Field(gt=0)
    min_order_value: float = Field(default=0, ge=0)
    max_discount: Optional[float] = Field(default=None, gt=0)
    max_uses: Optional[int] = Field(default=None, ge=1)
    per_user_limit: Optional[int] = Field(default=None, ge=1)
    is_active: bool = True
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: str) -> str:
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_percentage_range(self):
        if self.discount_type == DiscountType.PERCENTAGE and self.discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100")
        if self.valid_from and self.valid_until and self.valid_from >= self.valid_until:
            raise ValueError("valid_from must be before valid_until")
        return self


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(default=None, min_length=3, max_length=50)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(default=None, gt=0)
    min_order_value: Optional[float] = Field(default=None, ge=0)
    max_discount: Optional[float] = Field(default=None, gt=0)
    max_uses: Optional[int] = Field(default=None, ge=1)
    per_user_limit: Optional[int] = Field(default=None, ge=1)
    is_active: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None

    @field_validator("code")
    @classmethod
    def normalize_code(cls, v: Optional[str]) -> Optional[str]:
        return v.strip().upper() if v else v


class CouponRead(CouponBase):
    id: uuid.UUID
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CouponListResponse(BaseModel):
    items: List[CouponRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class CouponValidateRequest(BaseModel):
    code: str


class CouponValidateResponse(BaseModel):
    code: str
    discount_type: DiscountType
    discount_value: float
    discount_amount: float
    message: str
