"""
Product catalog, search, and detail endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.product import ProductRead

router = APIRouter()


@router.get("/", response_model=List[ProductRead])
def list_products(
    category: Optional[str] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    """List/filter products with pagination. TODO: implement."""
    raise NotImplementedError


@router.get("/search", response_model=List[ProductRead])
def search_products(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Smart search with suggestions. TODO: implement (e.g. Postgres trigram or Elasticsearch)."""
    raise NotImplementedError


@router.get("/{slug}", response_model=ProductRead)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Get full product detail including images and specs. TODO: implement."""
    raise NotImplementedError


@router.get("/{slug}/related", response_model=List[ProductRead])
def get_related_products(slug: str, db: Session = Depends(get_db)):
    """Get related/recommended products. TODO: implement."""
    raise NotImplementedError
