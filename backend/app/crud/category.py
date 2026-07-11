"""CRUD operations for Category."""
import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Category, Product
from app.schemas.product import CategoryCreate, CategoryUpdate
from app.utils.text import slugify


def _unique_slug(db: Session, name: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    base = slugify(name)
    slug = base
    suffix = 2
    while True:
        query = select(Category.id).where(Category.slug == slug)
        if exclude_id is not None:
            query = query.where(Category.id != exclude_id)
        if db.scalar(query) is None:
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


def get(db: Session, id: uuid.UUID) -> Optional[Category]:
    return db.get(Category, id)


def get_by_slug(db: Session, slug: str) -> Optional[Category]:
    return db.scalar(select(Category).where(Category.slug == slug))


def get_multi(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


def get_by_name(db: Session, name: str) -> Optional[Category]:
    return db.scalar(select(Category).where(func.lower(Category.name) == name.strip().lower()))


def product_count(db: Session, category_id: uuid.UUID) -> int:
    return db.scalar(select(func.count(Product.id)).where(Product.category_id == category_id)) or 0


def create(db: Session, obj_in: CategoryCreate) -> Category:
    db_obj = Category(
        name=obj_in.name,
        slug=_unique_slug(db, obj_in.name),
        description=obj_in.description,
        image_url=obj_in.image_url,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: Category, obj_in: CategoryUpdate) -> Category:
    data = obj_in.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != db_obj.name:
        db_obj.slug = _unique_slug(db, data["name"], exclude_id=db_obj.id)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, db_obj: Category) -> None:
    db.delete(db_obj)
    db.commit()
