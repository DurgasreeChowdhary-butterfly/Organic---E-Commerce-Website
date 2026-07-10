"""
User profile endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.user import UserRead

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user=Depends(get_current_user)):
    """Return the logged-in user's profile. TODO: implement."""
    raise NotImplementedError


@router.put("/me", response_model=UserRead)
def update_my_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Update profile details. TODO: implement."""
    raise NotImplementedError
