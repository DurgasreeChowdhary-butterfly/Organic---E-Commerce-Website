"""Pydantic schemas for User auth and profile."""
import uuid
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    id: uuid.UUID
    is_verified: bool

    class Config:
        from_attributes = True


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp_code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
