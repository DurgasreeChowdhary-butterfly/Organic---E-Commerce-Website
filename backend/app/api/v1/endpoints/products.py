"""
Product catalog, search, and detail endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import product as product_crud
from app.db.session import get_db
from app.schemas.product import ProductListResponse, ProductRead

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    sort: str = Query("newest", pattern="^(newest|price_low|price_high|name_asc|popular)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List/filter/search/sort products with pagination. `category` accepts a comma-separated list of slugs."""
    filters = product_crud.ProductFilters(
        category_slugs=[s.strip() for s in category.split(",") if s.strip()] if category else None,
        search=search,
        min_price=min_price,
        max_price=max_price,
        is_featured=featured,
        is_best_seller=best_seller,
        is_new_arrival=new_arrival,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    items, total = product_crud.list_products(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/featured", response_model=List[ProductRead])
def featured_products(limit: int = Query(8, ge=1, le=50), db: Session = Depends(get_db)):
    """Curated featured products (is_featured = true)."""
    return product_crud.get_featured(db, limit)


@router.get("/latest", response_model=List[ProductRead])
def latest_products(limit: int = Query(8, ge=1, le=50), db: Session = Depends(get_db)):
    """Most recently added products."""
    return product_crud.get_latest(db, limit)


@router.get("/search", response_model=ProductListResponse)
def search_products(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search products by name/description/SKU."""
    filters = product_crud.ProductFilters(search=q, page=page, page_size=page_size)
    items, total = product_crud.list_products(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.get("/{slug}", response_model=ProductRead)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Get full product detail including images."""
    product = product_crud.get_by_slug(db, slug)
    if product is None or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("/{slug}/related", response_model=List[ProductRead])
def get_related_products(slug: str, limit: int = Query(4, ge=1, le=20), db: Session = Depends(get_db)):
    """Get related products (same category)."""
    product = product_crud.get_by_slug(db, slug)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product_crud.get_related(db, product, limit)
