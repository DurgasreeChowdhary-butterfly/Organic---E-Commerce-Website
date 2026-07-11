"""
Wishlist endpoints. All routes require an authenticated user — each user
has exactly one wishlist, created lazily on first access.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.v1.endpoints.cart import _serialize_cart
from app.crud import cart as cart_crud
from app.crud import product as product_crud
from app.crud import wishlist as wishlist_crud
from app.db.session import get_db
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.wishlist import MoveToCartResponse, WishlistItemRead, WishlistRead

router = APIRouter()


def _serialize_wishlist(wishlist: Wishlist) -> WishlistRead:
    items = [WishlistItemRead(id=item.id, product=item.product) for item in wishlist.items]
    return WishlistRead(items=items, count=len(items))


@router.get("/", response_model=WishlistRead)
def get_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get saved wishlist products, with a live count."""
    wishlist = wishlist_crud.get_or_create_wishlist(db, current_user.id)
    return _serialize_wishlist(wishlist)


@router.post("/items/{product_id}", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(product_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Save a product to the wishlist. Adding an already-saved product is a no-op (no duplicates)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    wishlist = wishlist_crud.get_or_create_wishlist(db, current_user.id)
    wishlist = wishlist_crud.add_item(db, wishlist, product)
    return _serialize_wishlist(wishlist)


@router.delete("/items/{product_id}", response_model=WishlistRead)
def remove_from_wishlist(product_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove a product from the wishlist."""
    wishlist = wishlist_crud.get_or_create_wishlist(db, current_user.id)
    try:
        wishlist = wishlist_crud.remove_item(db, wishlist, product_id)
    except wishlist_crud.WishlistItemNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found in wishlist")
    return _serialize_wishlist(wishlist)


@router.post("/items/{product_id}/move-to-cart", response_model=MoveToCartResponse)
def move_to_cart(product_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a wishlist product to the cart and remove it from the wishlist, atomically."""
    product = product_crud.get(db, product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    cart = cart_crud.get_or_create_cart(db, current_user.id)
    try:
        cart = cart_crud.add_item(db, cart, product, 1)
    except cart_crud.ProductUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except cart_crud.InsufficientStock as exc:
        detail = "This product is out of stock" if exc.available == 0 else f"Only {exc.available} left in stock"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    wishlist = wishlist_crud.get_or_create_wishlist(db, current_user.id)
    try:
        wishlist = wishlist_crud.remove_item(db, wishlist, product_id)
    except wishlist_crud.WishlistItemNotFound:
        pass  # already removed (e.g. duplicate request) -- cart add above still succeeded

    return MoveToCartResponse(cart=_serialize_cart(cart), wishlist=_serialize_wishlist(wishlist))
