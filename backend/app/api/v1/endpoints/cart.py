"""
Shopping cart endpoints. All routes require an authenticated user — each
user has exactly one cart, created lazily on first access.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import cart as cart_crud
from app.crud import product as product_crud
from app.db.session import get_db
from app.models.cart import Cart
from app.models.user import User
from app.schemas.cart import CartItemCreate, CartItemRead, CartItemUpdate, CartRead

router = APIRouter()


def _serialize_cart(cart: Cart) -> CartRead:
    items = [
        CartItemRead(id=item.id, product=item.product, quantity=item.quantity, **cart_crud.line_values(item))
        for item in cart.items
    ]
    summary = cart_crud.summarize(cart)
    return CartRead(items=items, item_count=sum(i.quantity for i in cart.items), **summary)


def _stock_error_detail(exc: cart_crud.InsufficientStock) -> str:
    if exc.available == 0:
        return "This product is out of stock"
    return f"Only {exc.available} left in stock"


@router.get("/", response_model=CartRead)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current user's cart with a full price summary."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    return _serialize_cart(cart)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_to_cart(payload: CartItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a product to the cart (merges into an existing line), validating stock/availability."""
    product = product_crud.get(db, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    cart = cart_crud.get_or_create_cart(db, current_user.id)
    try:
        cart = cart_crud.add_item(db, cart, product, payload.quantity)
    except cart_crud.ProductUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except cart_crud.InsufficientStock as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=_stock_error_detail(exc))
    return _serialize_cart(cart)


@router.put("/items/{item_id}", response_model=CartRead)
def update_cart_item(
    item_id: uuid.UUID,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the quantity of a cart item, validating stock/availability."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    try:
        cart = cart_crud.update_item_quantity(db, cart, item_id, payload.quantity)
    except cart_crud.CartItemNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    except cart_crud.ProductUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except cart_crud.InsufficientStock as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=_stock_error_detail(exc))
    return _serialize_cart(cart)


@router.delete("/items/{item_id}", response_model=CartRead)
def remove_cart_item(item_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove an item from the cart."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    try:
        cart = cart_crud.remove_item(db, cart, item_id)
    except cart_crud.CartItemNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return _serialize_cart(cart)


@router.delete("/", response_model=CartRead)
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove all items from the cart."""
    cart = cart_crud.get_or_create_cart(db, current_user.id)
    cart = cart_crud.clear_cart(db, cart)
    return _serialize_cart(cart)
