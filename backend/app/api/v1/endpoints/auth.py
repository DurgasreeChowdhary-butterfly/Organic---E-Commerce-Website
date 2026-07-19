"""
Authentication endpoints: register, login, refresh, logout, forgot/reset
password.

OTP verification requires an external SMS provider and is out of scope
here — it remains an unimplemented stub.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import enforce_rate_limit
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.crud import password_reset as password_reset_crud
from app.crud import token as token_crud
from app.crud import user as user_crud
from app.db.session import get_db
from app.services import email_service
from app.schemas.user import (
    AuthResponse,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LogoutRequest,
    MessageResponse,
    OTPRequest,
    OTPVerify,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
)

logger = logging.getLogger(__name__)

router = APIRouter()

GENERIC_FORGOT_PASSWORD_RESPONSE = MessageResponse(
    message="If an account exists for that email, a password reset link has been sent."
)


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


@router.post("/google", response_model=AuthResponse)
def google_login(payload: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Continue with Google. Verifies the ID token's signature and audience
    server-side (never trusts a client-asserted email), then finds-or-links-
    or-creates the corresponding local User and issues the same access/
    refresh token pair as password login — full reuse of the existing JWT
    issuance and refresh-token persistence."""
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"google-login:{client_ip}", max_requests=20, window_seconds=60)

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In is not configured on this server yet",
        )

    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google sign-in token")

    email = claims.get("email")
    if not email or not claims.get("email_verified", False):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google account has no verified email")

    user = user_crud.get_or_create_google_user(
        db, google_id=claims["sub"], email=email, full_name=claims.get("name") or email.split("@")[0]
    )
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


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """Request a password reset email.

    Always returns the same generic message regardless of whether the
    email is registered, active, or Google-only (no local password) — this
    prevents user enumeration per OWASP guidance. Rate-limited per-IP and
    per-email to slow down abuse.
    """
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"forgot-password:{client_ip}", max_requests=5, window_seconds=300)
    enforce_rate_limit(f"forgot-password:{payload.email.lower()}", max_requests=3, window_seconds=900)

    user = user_crud.get_by_email(db, payload.email)
    if user is not None and user.is_active and user.hashed_password is not None:
        raw_token = password_reset_crud.create(db, user_id=user.id)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        try:
            email_service.send_password_reset_email(
                to_email=user.email,
                full_name=user.full_name,
                reset_url=reset_url,
                expires_in_minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
            )
        except Exception:
            # Never let a delivery failure change the response the client
            # sees — that would leak whether the address exists.
            logger.exception("Failed to send password reset email to %s", user.email)

    return GENERIC_FORGOT_PASSWORD_RESPONSE


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    """Consume a password reset token and set a new password.

    Tokens are single-use (invalidated immediately on success) and expire
    after PASSWORD_RESET_TOKEN_EXPIRE_MINUTES. All existing refresh tokens
    for the user are revoked afterwards so other sessions must
    re-authenticate with the new password.
    """
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"reset-password:{client_ip}", max_requests=10, window_seconds=300)

    invalid_exc = HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    db_token = password_reset_crud.get_valid_by_raw_token(db, payload.token)
    if db_token is None:
        raise invalid_exc

    user = user_crud.get(db, db_token.user_id)
    if user is None or not user.is_active:
        raise invalid_exc

    user_crud.set_password(db, user, payload.new_password)
    password_reset_crud.mark_used(db, db_token)
    token_crud.revoke_all_for_user(db, user.id)

    return MessageResponse(message="Your password has been reset successfully. Please log in with your new password.")
