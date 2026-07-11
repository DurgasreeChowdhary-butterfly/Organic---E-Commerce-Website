"""
Authentication endpoints: register, login, refresh, logout.

OTP verification and forgot-password require an external SMS/email
provider and are out of scope here — they remain unimplemented stubs.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.rate_limit import enforce_rate_limit
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.crud import token as token_crud
from app.crud import user as user_crud
from app.db.session import get_db
from app.schemas.user import (
    AuthResponse,
    LogoutRequest,
    OTPRequest,
    OTPVerify,
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
)

router = APIRouter()


def _issue_tokens(db: Session, user_id) -> tuple[str, str]:
    access_token = create_access_token(str(user_id))
    refresh_token, refresh_payload = create_refresh_token(str(user_id))
    token_crud.create(db, user_id=user_id, payload=refresh_payload)
    return access_token, refresh_token


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new customer account and issue tokens."""
    enforce_rate_limit(f"register:{request.client.host if request.client else 'unknown'}", max_requests=5, window_seconds=60)
    if user_crud.get_by_email(db, payload.email) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    if user_crud.get_by_phone(db, payload.phone) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number is already registered")

    user = user_crud.create(db, payload)
    access_token, refresh_token = _issue_tokens(db, user.id)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate and issue access/refresh tokens."""
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"login:{client_ip}", max_requests=10, window_seconds=60)
    enforce_rate_limit(f"login:{payload.email.lower()}", max_requests=10, window_seconds=60)
    user = user_crud.authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    access_token, refresh_token = _issue_tokens(db, user.id)
    return AuthResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid, unrevoked refresh token for a new token pair (rotation)."""
    invalid_exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    try:
        decoded = decode_token(payload.refresh_token)
    except JWTError:
        raise invalid_exc

    if decoded.get("type") != "refresh":
        raise invalid_exc

    stored = token_crud.get_by_jti(db, decoded.get("jti", ""))
    if not token_crud.is_valid(stored):
        raise invalid_exc

    user = user_crud.get(db, stored.user_id)
    if user is None or not user.is_active:
        raise invalid_exc

    # Rotate: revoke the used refresh token and issue a fresh pair.
    token_crud.revoke(db, stored)
    access_token, new_refresh_token = _issue_tokens(db, user.id)
    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    """Revoke a refresh token so it can no longer be used (server-side logout)."""
    try:
        decoded = decode_token(payload.refresh_token)
    except JWTError:
        return
    stored = token_crud.get_by_jti(db, decoded.get("jti", ""))
    if stored is not None and not stored.revoked:
        token_crud.revoke(db, stored)
    return


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
