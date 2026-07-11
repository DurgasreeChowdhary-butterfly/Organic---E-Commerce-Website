"""
Product category browsing endpoints (public, read-only for customers).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import category as category_crud
from app.db.session import get_db
from app.schemas.product import CategoryRead

router = APIRouter()


@router.get("/", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """List all categories, with each category's live product count."""
    categories = category_crud.get_multi(db)
    return [
        CategoryRead.model_validate(c, from_attributes=True).model_copy(
            update={"product_count": category_crud.product_count(db, c.id)}
        )
        for c in categories
    ]


@router.get("/{slug}", response_model=CategoryRead)
def get_category(slug: str, db: Session = Depends(get_db)):
    """Get a single category by slug."""
    category = category_crud.get_by_slug(db, slug)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryRead.model_validate(category, from_attributes=True).model_copy(
        update={"product_count": category_crud.product_count(db, category.id)}
    )
