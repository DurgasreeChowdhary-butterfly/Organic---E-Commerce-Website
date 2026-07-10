"""Product, Category, and ProductImage models."""
import uuid
from datetime import datetime

from sqlalchemy import String, Numeric, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    parent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=True)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(255), index=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    specifications: Mapped[str] = mapped_column(Text, nullable=True)  # JSON string, TODO: use JSONB
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=10)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False)
    is_new_arrival: Mapped[bool] = mapped_column(Boolean, default=False)
    is_seasonal: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    gst_percentage: Mapped[float] = mapped_column(Numeric(5, 2), default=5.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product")
    # TODO: relationships to reviews, related products


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="images")
