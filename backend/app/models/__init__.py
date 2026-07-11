"""
Import all models here so Alembic autogenerate can discover them.
"""
from app.models.user import User, Address
from app.models.token import RefreshToken
from app.models.product import Product, Category, ProductImage
from app.models.cart import Cart, CartItem
from app.models.wishlist import Wishlist, WishlistItem
from app.models.order import Order, OrderItem
from app.models.coupon import Coupon, CouponRedemption
from app.models.payment import Payment
from app.models.review import Review
