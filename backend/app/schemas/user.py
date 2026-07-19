"""Pydantic schemas for User auth and profile."""
import re
import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import AuthProvider

PASSWORD_MIN_LENGTH = 8


def _validate_password_strength(value: str) -> str:
    if len(value) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must include a lowercase letter")
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must include an uppercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must include a number")
    if not re.search(r"[^\w\s]", value):
        raise ValueError("Password must include a special character")
    return value


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    # Overrides UserBase.phone (required) — Google-only accounts never
    # collect one.
    phone: Optional[str] = None
    id: uuid.UUID
    is_verified: bool
    is_admin: bool
    auth_provider: AuthProvider

    class Config:
        from_attributes = True


class GoogleLoginRequest(BaseModel):
    id_token: str


class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp_code: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenResponse):
    user: UserRead


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    _validate_new_password = field_validator("new_password")(_validate_password_strength)


class MessageResponse(BaseModel):
    message: str
