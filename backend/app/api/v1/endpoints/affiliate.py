"""
Customer-facing affiliate endpoints: registration, profile, dashboard, and
public click tracking. "Affiliate login" is intentionally not a separate
endpoint — affiliates are regular Users (see models/affiliate.py), so they
authenticate via the existing /auth/login and the frontend checks
GET /affiliate/me to decide whether to show the affiliate dashboard link.

Admin approval/rejection/blocking/commission management lives in admin.py
alongside the rest of the admin-only surface.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import enforce_rate_limit
from app.crud import affiliate as affiliate_crud
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.affiliate import (
    AffiliateDashboard,
    AffiliateRead,
    AttributedOrderSummary,
)

router = APIRouter()


@router.post("/register", response_model=AffiliateRead, status_code=status.HTTP_201_CREATED)
def register_affiliate(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Apply to become an affiliate. Starts out `pending` — see admin.py for approval."""
    try:
        return affiliate_crud.register(db, current_user)
    except affiliate_crud.AffiliateAlreadyRegistered as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


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
