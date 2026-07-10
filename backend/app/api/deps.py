"""
Shared FastAPI dependencies: DB session, current user, admin guard.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Decode JWT and return the current authenticated user. TODO: implement."""
    raise NotImplementedError


def get_current_active_admin(current_user=Depends(get_current_user)):
    """Guard that restricts access to admin-only endpoints. TODO: implement."""
    raise NotImplementedError
