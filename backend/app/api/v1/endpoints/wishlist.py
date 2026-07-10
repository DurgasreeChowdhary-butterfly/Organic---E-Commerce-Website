"""
Wishlist endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
def get_wishlist(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Get saved wishlist products. TODO: implement."""
    raise NotImplementedError


@router.post("/items/{product_id}")
def add_to_wishlist(product_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Save a product to the wishlist. TODO: implement."""
    raise NotImplementedError


@router.delete("/items/{product_id}")
def remove_from_wishlist(product_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove a product from the wishlist. TODO: implement."""
    raise NotImplementedError


@router.post("/items/{product_id}/move-to-cart")
def move_to_cart(product_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Move a wishlist item into the cart. TODO: implement."""
    raise NotImplementedError
