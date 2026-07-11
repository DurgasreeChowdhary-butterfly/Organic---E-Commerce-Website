"""
Admin-only endpoints: dashboard stats, product/category/order/customer/inventory management.
All routes here must be protected by get_current_active_admin.
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.crud import category as category_crud
from app.crud import product as product_crud
from app.models.product import ProductImage
from app.schemas.product import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
    ProductCreate,
    ProductImageRead,
    ProductListResponse,
    ProductRead,
    ProductUpdate,
)
from app.services.storage_service import FileTooLarge, UnsupportedFileType, upload_product_image

router = APIRouter(dependencies=[Depends(get_current_active_admin)])


# --- Dashboard ---
@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Revenue, orders, customers, products, sales, low-stock summary. TODO: implement."""
    raise NotImplementedError


# --- Product management ---
@router.get("/products", response_model=ProductListResponse)
def admin_list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all products (including inactive) for the admin table, with search + pagination."""
    filters = product_crud.ProductFilters(
        category_slugs=[s.strip() for s in category.split(",") if s.strip()] if category else None,
        search=search,
        include_inactive=True,
        page=page,
        page_size=page_size,
    )
    items, total = product_crud.list_products(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    if category_crud.get(db, payload.category_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    if product_crud.get_by_sku(db, payload.sku) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already in use")
    return product_crud.create(db, payload)


@router.put("/products/{product_id}", response_model=ProductRead)
def admin_update_product(product_id: uuid.UUID, payload: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if payload.category_id is not None and category_crud.get(db, payload.category_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    if payload.sku is not None and payload.sku != product.sku:
        existing = product_crud.get_by_sku(db, payload.sku)
        if existing is not None and existing.id != product.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SKU already in use")
    return product_crud.update(db, product, payload)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a product."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product_crud.remove(db, product)


@router.post("/products/{product_id}/images", response_model=List[ProductImageRead])
def admin_upload_product_images(
    product_id: uuid.UUID,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    """Upload one or more images for a product (local disk storage)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    has_primary = any(img.is_primary for img in product.images)
    created: List[ProductImage] = []
    for i, file in enumerate(files):
        content = file.file.read()
        try:
            url = upload_product_image(content, file.content_type or "")
        except (UnsupportedFileType, FileTooLarge) as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
        image = ProductImage(
            product_id=product.id,
            image_url=url,
            is_primary=(not has_primary and i == 0),
            sort_order=len(product.images) + i,
        )
        db.add(image)
        created.append(image)
    db.commit()
    for image in created:
        db.refresh(image)
    return created


@router.delete("/products/{product_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_product_image(product_id: uuid.UUID, image_id: uuid.UUID, db: Session = Depends(get_db)):
    """Remove a single product image."""
    image = db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    db.delete(image)
    db.commit()


# --- Category management ---
@router.get("/categories", response_model=List[CategoryRead])
def admin_list_categories(db: Session = Depends(get_db)):
    """List all categories with live product counts."""
    categories = category_crud.get_multi(db)
    return [
        CategoryRead.model_validate(c, from_attributes=True).model_copy(
            update={"product_count": category_crud.product_count(db, c.id)}
        )
        for c in categories
    ]


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def admin_create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category."""
    if category_crud.get_by_name(db, payload.name) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A category with this name already exists")
    return category_crud.create(db, payload)


@router.put("/categories/{category_id}", response_model=CategoryRead)
def admin_update_category(category_id: uuid.UUID, payload: CategoryUpdate, db: Session = Depends(get_db)):
    """Update an existing category."""
    category = category_crud.get(db, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if payload.name is not None and payload.name.strip().lower() != category.name.strip().lower():
        existing = category_crud.get_by_name(db, payload.name)
        if existing is not None and existing.id != category.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A category with this name already exists")
    return category_crud.update(db, category, payload)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_category(category_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a category. Blocked if any products still reference it."""
    category = category_crud.get(db, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if category_crud.product_count(db, category_id) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a category that still has products. Reassign or delete those products first.",
        )
    category_crud.remove(db, category)


# --- Order management ---
@router.get("/orders")
def admin_list_orders(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.put("/orders/{order_id}/status")
def admin_update_order_status(order_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.post("/orders/{order_id}/cancel")
def admin_cancel_order(order_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.get("/orders/{order_id}/invoice")
def admin_generate_invoice(order_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


# --- Customer management ---
@router.get("/customers")
def admin_list_customers(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.get("/customers/{customer_id}")
def admin_get_customer(customer_id: str, db: Session = Depends(get_db)):
    """Customer details + purchase history. TODO: implement."""
    raise NotImplementedError


# --- Inventory management ---
@router.get("/inventory")
def admin_get_inventory(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.get("/inventory/low-stock")
def admin_get_low_stock(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.put("/inventory/{product_id}/stock")
def admin_update_stock(product_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.get("/inventory/reports")
def admin_inventory_reports(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


# --- Coupon management ---
@router.post("/coupons")
def admin_create_coupon(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.put("/coupons/{coupon_id}")
def admin_update_coupon(coupon_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.delete("/coupons/{coupon_id}")
def admin_delete_coupon(coupon_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError
