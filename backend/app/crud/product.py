"""CRUD operations for Product."""
import uuid
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.product import Category, Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.text import slugify

SORT_OPTIONS = {
    "newest": Product.created_at.desc(),
    "price_low": Product.price.asc(),
    "price_high": Product.price.desc(),
    "name_asc": Product.name.asc(),
    "popular": Product.is_featured.desc(),
}


def _unique_slug(db: Session, name: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    base = slugify(name)
    slug = base
    suffix = 2
    while True:
        query = select(Product.id).where(Product.slug == slug)
        if exclude_id is not None:
            query = query.where(Product.id != exclude_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


def _with_relations(query):
    return query.options(selectinload(Product.category), selectinload(Product.images))


def get(db: Session, id: uuid.UUID) -> Optional[Product]:
    return db.scalar(_with_relations(select(Product).where(Product.id == id)))


def get_by_slug(db: Session, slug: str) -> Optional[Product]:
    return db.scalar(_with_relations(select(Product).where(Product.slug == slug)))


def get_by_sku(db: Session, sku: str) -> Optional[Product]:
    return db.scalar(select(Product).where(Product.sku == sku))


@dataclass
class ProductFilters:
    category_slugs: Optional[list[str]] = None
    search: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_featured: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    include_inactive: bool = False
    sort: str = "newest"
    page: int = 1
    page_size: int = 20


def _apply_filters(query, filters: ProductFilters):
    if not filters.include_inactive:
        query = query.where(Product.is_active.is_(True))
    if filters.category_slugs:
        query = query.join(Category).where(Category.slug.in_(filters.category_slugs))
    if filters.search:
        like = f"%{filters.search.strip()}%"
        query = query.where(or_(Product.name.ilike(like), Product.description.ilike(like), Product.sku.ilike(like)))
    if filters.min_price is not None:
        query = query.where(func.coalesce(Product.discount_price, Product.price) >= filters.min_price)
    if filters.max_price is not None:
        query = query.where(func.coalesce(Product.discount_price, Product.price) <= filters.max_price)
    if filters.is_featured is not None:
        query = query.where(Product.is_featured.is_(filters.is_featured))
    if filters.is_best_seller is not None:
        query = query.where(Product.is_best_seller.is_(filters.is_best_seller))
    if filters.is_new_arrival is not None:
        query = query.where(Product.is_new_arrival.is_(filters.is_new_arrival))
    return query


def list_products(db: Session, filters: ProductFilters) -> tuple[list[Product], int]:
    base_query = _apply_filters(select(Product), filters)

    total = db.scalar(select(func.count()).select_from(base_query.subquery())) or 0

    order_clause = SORT_OPTIONS.get(filters.sort, SORT_OPTIONS["newest"])
    page = max(filters.page, 1)
    page_size = max(min(filters.page_size, 100), 1)

    items_query = _with_relations(base_query).order_by(order_clause).offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(items_query))
    return items, total


def get_featured(db: Session, limit: int = 8) -> list[Product]:
    query = _with_relations(
        select(Product).where(Product.is_active.is_(True), Product.is_featured.is_(True))
    ).order_by(Product.created_at.desc()).limit(limit)
    return list(db.scalars(query))


def get_latest(db: Session, limit: int = 8) -> list[Product]:
    query = _with_relations(
        select(Product).where(Product.is_active.is_(True))
    ).order_by(Product.created_at.desc()).limit(limit)
    return list(db.scalars(query))


def get_related(db: Session, product: Product, limit: int = 4) -> list[Product]:
    query = _with_relations(
        select(Product).where(
            Product.category_id == product.category_id,
            Product.id != product.id,
            Product.is_active.is_(True),
        )
    ).order_by(Product.created_at.desc()).limit(limit)
    return list(db.scalars(query))


def create(db: Session, obj_in: ProductCreate) -> Product:
    db_obj = Product(
        category_id=obj_in.category_id,
        sku=obj_in.sku,
        name=obj_in.name,
        slug=_unique_slug(db, obj_in.name),
        description=obj_in.description,
        price=obj_in.price,
        discount_price=obj_in.discount_price,
        gst_percentage=obj_in.gst_percentage,
        stock_quantity=obj_in.stock_quantity,
        is_active=obj_in.is_active,
        is_featured=obj_in.is_featured,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def update(db: Session, db_obj: Product, obj_in: ProductUpdate) -> Product:
    data = obj_in.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != db_obj.name:
        db_obj.slug = _unique_slug(db, data["name"], exclude_id=db_obj.id)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return get(db, db_obj.id)


def remove(db: Session, db_obj: Product) -> None:
    db.delete(db_obj)
    db.commit()
