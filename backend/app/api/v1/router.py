"""
Aggregates all v1 endpoint routers into a single APIRouter,
mounted in main.py under the /api/v1 prefix.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    categories,
    products,
    cart,
    wishlist,
    orders,
    payments,
    coupons,
    addresses,
    chatbot,
    admin,
    affiliate,
    branding,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(addresses.router, prefix="/addresses", tags=["addresses"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["coupons"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(affiliate.router, prefix="/affiliate", tags=["affiliate"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(branding.router, prefix="/branding", tags=["branding"])
