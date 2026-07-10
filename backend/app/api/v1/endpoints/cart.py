"""
Shopping cart endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.cart import CartItemCreate, CartItemUpdate

router = APIRouter()


@router.get("/")
def get_cart(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current user's cart with price summary. TODO: implement."""
    raise NotImplementedError


@router.post("/items")
def add_to_cart(payload: CartItemCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a product to the cart. TODO: implement."""
    raise NotImplementedError


@router.put("/items/{item_id}")
def update_cart_item(item_id: str, payload: CartItemUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Update quantity of a cart item. TODO: implement."""
    raise NotImplementedError


@router.delete("/items/{item_id}")
def remove_cart_item(item_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove an item from the cart. TODO: implement."""
    raise NotImplementedError
