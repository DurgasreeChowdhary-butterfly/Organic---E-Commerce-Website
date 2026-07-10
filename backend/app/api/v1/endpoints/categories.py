"""
Product category browsing endpoints (public, read-only for customers).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.product import CategoryRead

router = APIRouter()


@router.get("/", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """List all active categories. TODO: implement."""
    raise NotImplementedError


@router.get("/{slug}", response_model=CategoryRead)
def get_category(slug: str, db: Session = Depends(get_db)):
    """Get a single category by slug. TODO: implement."""
    raise NotImplementedError
