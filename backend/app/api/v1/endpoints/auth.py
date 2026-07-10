"""
Authentication endpoints: register, login, refresh, OTP verification, forgot password.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, OTPRequest, OTPVerify

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new customer account. TODO: implement."""
    raise NotImplementedError


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and issue access/refresh tokens. TODO: implement."""
    raise NotImplementedError


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str):
    """Exchange a valid refresh token for a new access token. TODO: implement."""
    raise NotImplementedError


@router.post("/otp/request")
def request_otp(payload: OTPRequest):
    """Send an OTP to the given phone number. TODO: integrate SMS provider."""
    raise NotImplementedError


@router.post("/otp/verify")
def verify_otp(payload: OTPVerify):
    """Verify an OTP code. TODO: implement."""
    raise NotImplementedError


@router.post("/forgot-password")
def forgot_password(email: str):
    """Trigger a password reset email. TODO: implement."""
    raise NotImplementedError
