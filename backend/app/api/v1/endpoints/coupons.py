"""
Coupon validation endpoints (public application logic; management lives under admin).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import cart as cart_crud
from app.crud import coupon as coupon_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.coupon import CouponValidateRequest, CouponValidateResponse

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    payload: CouponValidateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Validate a coupon code against the current user's cart and return the discount it would apply."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    cart_totals = cart_crud.summarize(cart)
    order_value = cart_totals["subtotal"] - cart_totals["discount"]

    try:
        coupon = coupon_crud.validate_for_order(db, payload.code, current_user.id, order_value)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid coupon code")
    except coupon_crud.CouponError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    discount_amount = coupon_crud.compute_discount(coupon, order_value)
    return CouponValidateResponse(
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value),
        discount_amount=discount_amount,
        message=f"Coupon applied — you saved ₹{discount_amount:.0f}",
    )
