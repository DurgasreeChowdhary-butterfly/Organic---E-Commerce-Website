"""
User profile endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import user as user_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Return the logged-in user's profile."""
    return current_user


@router.put("/me", response_model=UserRead)
def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile details (full name, email, phone)."""
    if payload.email is not None and payload.email != current_user.email:
        existing = user_crud.get_by_email(db, payload.email)
        if existing is not None and existing.id != current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already in use")

    if payload.phone is not None and payload.phone != current_user.phone:
        existing = user_crud.get_by_phone(db, payload.phone)
        if existing is not None and existing.id != current_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number is already in use")

    return user_crud.update(db, current_user, payload)
