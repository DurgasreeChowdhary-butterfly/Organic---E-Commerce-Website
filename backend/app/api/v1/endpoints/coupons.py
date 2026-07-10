"""
Coupon validation endpoints (public application logic; management lives under admin).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/validate")
def validate_coupon(code: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Validate a coupon code against the current cart. TODO: implement."""
    raise NotImplementedError
