"""
Customer-facing affiliate endpoints: registration, profile, dashboard, and
public click tracking. "Affiliate login" is intentionally not a separate
endpoint — affiliates are regular Users (see models/affiliate.py), so they
authenticate via the existing /auth/login and the frontend checks
GET /affiliate/me to decide whether to show the affiliate dashboard link.

Admin approval/rejection/blocking/commission management lives in admin.py
alongside the rest of the admin-only surface.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import enforce_rate_limit
from app.core.security import create_access_token, create_refresh_token
from app.crud import affiliate as affiliate_crud
from app.crud import token as token_crud
from app.crud import user as user_crud
from app.api.deps import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.user import User
from app.schemas.affiliate import (
    AffiliateApply,
    AffiliateApplyResponse,
    AffiliateDashboard,
    AffiliateRead,
    AttributedOrderSummary,
)
from app.schemas.user import UserCreate

router = APIRouter()


@router.post("/register", response_model=AffiliateRead, status_code=status.HTTP_201_CREATED)
def register_affiliate(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Apply to become an affiliate. Starts out `pending` — see admin.py for approval."""
    try:
        return affiliate_crud.register(db, current_user)
    except affiliate_crud.AffiliateAlreadyRegistered as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/apply", response_model=AffiliateApplyResponse, status_code=status.HTTP_201_CREATED)
def apply_affiliate(
    payload: AffiliateApply,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Public "Become an Affiliate" entry point — the one endpoint the
    public application page calls, regardless of login state.

    - Logged-in caller (valid Authorization header): converts the current
      account into an affiliate applicant. Any full_name/email/phone/
      password fields in the body are ignored.
    - Anonymous caller: creates a new customer account from full_name/
      email/phone/password (same validation as /auth/register) and applies
      it as an affiliate in the same request, returning fresh tokens so the
      frontend can log the visitor straight in.
    """
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit(f"affiliate-apply:{client_ip}", max_requests=10, window_seconds=60)

    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    new_user = None

    if current_user is not None:
        user = current_user
    else:
        required_fields = ("full_name", "email", "phone", "password", "confirm_password")
        missing = [field for field in required_fields if not getattr(payload, field)]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field(s): {', '.join(missing)}",
            )
        if payload.password != payload.confirm_password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
        if len(payload.password) < 6:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters")
        if user_crud.get_by_email(db, payload.email) is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
        if user_crud.get_by_phone(db, payload.phone) is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number is already registered")

        user = user_crud.create(
            db,
            UserCreate(full_name=payload.full_name, email=payload.email, phone=payload.phone, password=payload.password),
        )
        access_token = create_access_token(str(user.id))
        refresh_token, refresh_payload = create_refresh_token(str(user.id))
        token_crud.create(db, user_id=user.id, payload=refresh_payload)
        new_user = user

    try:
        affiliate = affiliate_crud.register(db, user)
    except affiliate_crud.AffiliateAlreadyRegistered as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return AffiliateApplyResponse(
        affiliate=affiliate,
        access_token=access_token,
        refresh_token=refresh_token,
        user=new_user,
    )


@router.get("/me", response_model=AffiliateRead)
def get_my_affiliate_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    affiliate = affiliate_crud.get_by_user_id(db, current_user.id)
    if affiliate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not registered as an affiliate")
    return affiliate


@router.get("/dashboard", response_model=AffiliateDashboard)
def get_affiliate_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Own performance only — clicks/orders/sales/commission. Never exposes
    other customers' personal information."""
    affiliate = affiliate_crud.get_by_user_id(db, current_user.id)
    if affiliate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not registered as an affiliate")

    totals = affiliate_crud.commission_totals(db, affiliate.id)
    return AffiliateDashboard(
        affiliate_code=affiliate.affiliate_code,
        status=affiliate.status,
        commission_percentage=float(affiliate.commission_percentage),
        total_clicks=affiliate_crud.click_count(db, affiliate.id),
        **totals,
    )


@router.get("/orders", response_model=list[AttributedOrderSummary])
def get_attributed_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Order attribution summary for the current affiliate — order number,
    status, total, and commission status/amount only. No customer name,
    email, phone, or address is included."""
    affiliate = affiliate_crud.get_by_user_id(db, current_user.id)
    if affiliate is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="You are not registered as an affiliate")

    results = []
    for order, commission in affiliate_crud.attributed_orders(db, affiliate.id):
        results.append(
            AttributedOrderSummary(
                order_id=order.id,
                order_number=order.order_number,
                order_status=order.status.value,
                total_amount=float(order.total_amount),
                commission_status=commission.status.value if commission else "pending",
                commission_amount=float(commission.amount) if commission else 0.0,
                created_at=order.created_at,
            )
        )
    return results


@router.post("/track-click", status_code=status.HTTP_204_NO_CONTENT)
def track_click(code: str, landing_path: str = "", request: Request = None, db: Session = Depends(get_db)):
    """Public, unauthenticated — called once by the frontend when a visitor
    lands on an affiliate link, purely to increment the click counter."""
    client_ip = request.client.host if request and request.client else "unknown"
    enforce_rate_limit(f"affiliate-click:{client_ip}", max_requests=30, window_seconds=60)

    affiliate = affiliate_crud.get_by_code(db, code)
    if affiliate is None:
        return
    affiliate_crud.record_click(db, affiliate, landing_path)
    return
