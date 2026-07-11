"""Pydantic schemas for the customer address book."""
import re
import uuid
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models.user import AddressType

PINCODE_RE = re.compile(r"^\d{6}$")
MOBILE_RE = re.compile(r"^[6-9]\d{9}$")


class AddressBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    mobile_number: str
    house_no: str = Field(min_length=1, max_length=100)
    street: str = Field(min_length=2, max_length=255)
    landmark: Optional[str] = Field(default=None, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str
    address_type: AddressType = AddressType.HOME
    is_default: bool = False

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        if not MOBILE_RE.match(v):
            raise ValueError("Enter a valid 10-digit mobile number")
        return v

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        if not PINCODE_RE.match(v):
            raise ValueError("Enter a valid 6-digit pincode")
        return v


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    mobile_number: Optional[str] = None
    house_no: Optional[str] = Field(default=None, min_length=1, max_length=100)
    street: Optional[str] = Field(default=None, min_length=2, max_length=255)
    landmark: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    state: Optional[str] = Field(default=None, min_length=2, max_length=100)
    pincode: Optional[str] = None
    address_type: Optional[AddressType] = None
    is_default: Optional[bool] = None

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not MOBILE_RE.match(v):
            raise ValueError("Enter a valid 10-digit mobile number")
        return v

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not PINCODE_RE.match(v):
            raise ValueError("Enter a valid 6-digit pincode")
        return v


class AddressRead(AddressBase):
    id: uuid.UUID

    class Config:
        from_attributes = True
