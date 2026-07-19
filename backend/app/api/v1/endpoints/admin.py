"""
Admin-only endpoints: dashboard stats, product/category/order/customer/inventory management.
All routes here must be protected by get_current_active_admin.
"""
import io
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.endpoints.orders import _serialize_order as _admin_serialize_order
from app.db.session import get_db
from app.api.deps import get_current_active_admin
from app.crud import affiliate as affiliate_crud
from app.crud import branding as branding_crud
from app.crud import category as category_crud
from app.crud import commission as commission_crud
from app.crud import coupon as coupon_crud
from app.crud import customer as customer_crud
from app.crud import dashboard as dashboard_crud
from app.crud import inventory as inventory_crud
from app.crud import order as order_crud
from app.crud import payment as payment_crud
from app.crud import product as product_crud
from app.models.affiliate import AffiliateStatus
from app.models.commission import CommissionStatus
from app.models.order import OrderStatus
from app.models.product import ProductImage
from app.models.user import User
from app.schemas.address import AddressRead
from app.schemas.affiliate import (
    AffiliateAdminRead,
    AffiliateCommissionUpdate,
    AffiliateListResponse,
    AttributedOrderSummary,
)
from app.schemas.branding import BrandingRead
from app.schemas.commission import CommissionListResponse, CommissionRead
from app.schemas.coupon import CouponCreate, CouponListResponse, CouponRead, CouponUpdate
from app.schemas.customer import CustomerDetailRead, CustomerListItemRead, CustomerListResponse
from app.schemas.dashboard import DashboardAnalyticsResponse, LowStockAlertRead, RecentOrderRead, TopSellingProductRead
from app.schemas.inventory import (
    InventoryItemRead,
    InventoryListResponse,
    InventoryTransactionListResponse,
    InventoryTransactionRead,
    StockAdjustmentRequest,
    StockCorrectionRequest,
)
from app.schemas.order import (
    AdminOrderListItemRead,
    AdminOrderListResponse,
    OrderCancelRequest,
    OrderRead,
    OrderRefundRequest,
    OrderStatusUpdateRequest,
)
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
from app.services.storage_service import (
    FileTooLarge,
    InvalidImageContent,
    UnsupportedFileType,
    delete_branding_logo,
    upload_branding_logo,
    upload_product_image,
)
from app.services.invoice_service import generate_invoice_pdf

router = APIRouter(dependencies=[Depends(get_current_active_admin)])


# --- Dashboard ---
@router.get("/dashboard/stats", response_model=DashboardAnalyticsResponse)
def get_dashboard_stats(trend_days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    """Revenue, order/customer/product counts, recent orders, top sellers,
    low-stock alerts, and a daily sales trend — all computed live from
    Order/OrderItem/Product/User/InventoryTransaction data."""
    stats = dashboard_crud.get_stats(db)
    recent_orders = dashboard_crud.get_recent_orders(db, limit=5)
    top_selling = dashboard_crud.get_top_selling_products(db, limit=5)
    low_stock = inventory_crud.list_low_stock_products(db, limit=10)
    trend = dashboard_crud.get_sales_trend(db, days=trend_days)

    return DashboardAnalyticsResponse(
        stats=stats,
        recent_orders=[
            RecentOrderRead(
                id=o.id, order_number=o.order_number, status=o.status, total_amount=float(o.total_amount),
                created_at=o.created_at, customer_name=o.user.full_name,
            )
            for o in recent_orders
        ],
        top_selling_products=[TopSellingProductRead(**p) for p in top_selling],
        low_stock_alerts=[
            LowStockAlertRead(
                id=p.id, name=p.name, sku=p.sku, stock_quantity=p.stock_quantity, low_stock_threshold=p.low_stock_threshold
            )
            for p in low_stock
        ],
        sales_trend=trend,
    )


# --- Branding management ---
@router.post("/branding/logo", response_model=BrandingRead)
def admin_upload_branding_logo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload or replace the storefront logo. The previous file (if any) is
    deleted only after the new one is validated and saved."""
    content = file.file.read()
    try:
        url = upload_branding_logo(content, file.content_type or "")
    except (UnsupportedFileType, FileTooLarge, InvalidImageContent) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    branding = branding_crud.get(db)
    previous_logo_url = branding.logo_url
    branding = branding_crud.set_logo(db, branding, url)
    if previous_logo_url:
        delete_branding_logo(previous_logo_url)
    return branding


@router.delete("/branding/logo", response_model=BrandingRead)
def admin_delete_branding_logo(db: Session = Depends(get_db)):
    """Remove the storefront logo — the customer header reverts to its default mark."""
    branding = branding_crud.get(db)
    if branding.logo_url:
        delete_branding_logo(branding.logo_url)
    return branding_crud.clear_logo(db, branding)


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
    """Delete a product. Blocked if it's still referenced by a customer's
    cart, wishlist, or a review (foreign keys with no cascade there)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    try:
        product_crud.remove(db, product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a product that's still in a customer's cart, wishlist, or has reviews. Deactivate it instead.",
        )


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
        except (UnsupportedFileType, FileTooLarge, InvalidImageContent) as exc:
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
@router.get("/orders", response_model=AdminOrderListResponse)
def admin_list_orders(
    search: Optional[str] = None,
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all orders with search (order number / customer name / email), status filter, and pagination."""
    filters = order_crud.OrderFilters(search=search, status=status_filter, page=page, page_size=page_size)
    items, total = order_crud.list_admin(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return AdminOrderListResponse(
        items=[
            AdminOrderListItemRead(
                id=o.id, order_number=o.order_number, status=o.status, total_amount=float(o.total_amount),
                item_count=sum(i.quantity for i in o.items), created_at=o.created_at,
                customer_name=o.user.full_name, customer_email=o.user.email,
            )
            for o in items
        ],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


@router.put("/orders/{order_id}/status", response_model=OrderRead)
def admin_update_order_status(order_id: uuid.UUID, payload: OrderStatusUpdateRequest, db: Session = Depends(get_db)):
    """Update an order's status (e.g. confirmed -> packed -> shipped -> ...)."""
    try:
        order = order_crud.get(db, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order = order_crud.update_status(db, order, payload.status, payload.note)
    except order_crud.OrderStatusIsFinal as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return _admin_serialize_order(order)


@router.post("/orders/{order_id}/cancel", response_model=OrderRead)
def admin_cancel_order(order_id: uuid.UUID, payload: OrderCancelRequest, db: Session = Depends(get_db)):
    """Cancel an order on the customer's behalf, restocking items."""
    try:
        order = order_crud.get(db, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order = order_crud.cancel(db, order, payload.reason)
    except order_crud.OrderCannotBeCancelled as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return _admin_serialize_order(order)


@router.post("/orders/{order_id}/refund", response_model=OrderRead)
def admin_refund_order(order_id: uuid.UUID, payload: OrderRefundRequest, db: Session = Depends(get_db)):
    """Refund an order's payment via Razorpay and mark it refunded."""
    try:
        order = order_crud.get(db, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order = order_crud.refund(db, order, payload.reason)
    except order_crud.OrderNotRefundable as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except order_crud.OrderStatusIsFinal as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except payment_crud.RazorpayRefundFailed:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not reach the payment gateway. Please try again.")
    return _admin_serialize_order(order)


@router.get("/orders/{order_id}/invoice")
def admin_generate_invoice(order_id: uuid.UUID, db: Session = Depends(get_db)):
    """Download a GST invoice PDF for any order."""
    try:
        order = order_crud.get(db, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    pdf_bytes = generate_invoice_pdf(order)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{order.order_number}-invoice.pdf"'},
    )


# --- Customer management ---
def _serialize_customer_list_item(user: User, stats: dict) -> CustomerListItemRead:
    s = stats.get(user.id, {"order_count": 0, "total_purchase_value": 0.0})
    return CustomerListItemRead(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        order_count=s["order_count"],
        total_purchase_value=s["total_purchase_value"],
    )


def _serialize_customer_order(order, user: User) -> AdminOrderListItemRead:
    return AdminOrderListItemRead(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        total_amount=float(order.total_amount),
        item_count=sum(i.quantity for i in order.items),
        created_at=order.created_at,
        customer_name=user.full_name,
        customer_email=user.email,
    )


@router.get("/customers", response_model=CustomerListResponse)
def admin_list_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List registered customers with search (name/email/phone) and pagination."""
    filters = customer_crud.CustomerFilters(search=search, page=page, page_size=page_size)
    users, stats, total = customer_crud.list_customers(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return CustomerListResponse(
        items=[_serialize_customer_list_item(u, stats) for u in users],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


@router.get("/customers/{customer_id}", response_model=CustomerDetailRead)
def admin_get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)):
    """Customer details: profile, saved addresses, order count, total valid
    purchase value, recent orders, and full purchase history."""
    try:
        user = customer_crud.get_customer(db, customer_id)
    except customer_crud.CustomerNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    addresses = customer_crud.get_addresses(db, customer_id)
    stats = customer_crud._order_stats_for_users(db, [customer_id]).get(
        customer_id, {"order_count": 0, "total_purchase_value": 0.0}
    )
    recent_orders = customer_crud.get_recent_orders(db, customer_id, limit=5)
    purchase_history = customer_crud.get_purchase_history(db, customer_id)

    return CustomerDetailRead(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        order_count=stats["order_count"],
        total_purchase_value=stats["total_purchase_value"],
        addresses=[AddressRead.model_validate(a, from_attributes=True) for a in addresses],
        recent_orders=[_serialize_customer_order(o, user) for o in recent_orders],
        purchase_history=[_serialize_customer_order(o, user) for o in purchase_history],
    )


# --- Inventory management ---


def _stock_status(product) -> str:
    if product.stock_quantity == 0:
        return "out_of_stock"
    if product.stock_quantity <= product.low_stock_threshold:
        return "low_stock"
    return "in_stock"


def _serialize_inventory_item(product, last_updated=None) -> InventoryItemRead:
    return InventoryItemRead(
        id=product.id,
        name=product.name,
        sku=product.sku,
        category_name=product.category.name,
        stock_quantity=product.stock_quantity,
        low_stock_threshold=product.low_stock_threshold,
        stock_status=_stock_status(product),
        last_updated=last_updated or product.created_at,
    )


@router.get("/inventory", response_model=InventoryListResponse)
def admin_get_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    stock_status: Optional[str] = Query(None, pattern="^(in_stock|low_stock|out_of_stock)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all products for the inventory table, with search, category and
    stock-status filters, and pagination."""
    filters = inventory_crud.InventoryFilters(
        search=search, category_slug=category, stock_status=stock_status, page=page, page_size=page_size
    )
    rows, total = inventory_crud.list_inventory(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return InventoryListResponse(
        items=[_serialize_inventory_item(product, last_updated) for product, last_updated in rows],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


@router.get("/inventory/low-stock", response_model=List[InventoryItemRead])
def admin_get_low_stock(db: Session = Depends(get_db)):
    """Products at or below their low-stock threshold (including out of stock)."""
    products = inventory_crud.list_low_stock_products(db, limit=100)
    return [_serialize_inventory_item(p) for p in products]


@router.post("/inventory/{product_id}/increase", response_model=InventoryItemRead)
def admin_increase_stock(
    product_id: uuid.UUID,
    payload: StockAdjustmentRequest,
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Manually increase a product's stock (e.g. new stock received)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product = inventory_crud.increase_stock(db, product, payload.quantity, payload.reason, current_admin.id)
    return _serialize_inventory_item(product)


@router.post("/inventory/{product_id}/decrease", response_model=InventoryItemRead)
def admin_decrease_stock(
    product_id: uuid.UUID,
    payload: StockAdjustmentRequest,
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Manually decrease a product's stock (e.g. damaged/lost goods)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    try:
        product = inventory_crud.decrease_stock(db, product, payload.quantity, payload.reason, current_admin.id)
    except inventory_crud.InsufficientStockForAdjustment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot decrease stock below 0 (current stock: {product.stock_quantity})")
    return _serialize_inventory_item(product)


@router.post("/inventory/{product_id}/correct", response_model=InventoryItemRead)
def admin_correct_stock(
    product_id: uuid.UUID,
    payload: StockCorrectionRequest,
    current_admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """Set a product's stock to an exact known-correct value (e.g. after a physical count)."""
    product = product_crud.get(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product = inventory_crud.correct_stock(db, product, payload.new_quantity, payload.reason, current_admin.id)
    return _serialize_inventory_item(product)


@router.get("/inventory/{product_id}/history", response_model=InventoryTransactionListResponse)
def admin_get_inventory_history(
    product_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Full audit trail of stock movements for a single product."""
    if product_crud.get(db, product_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    items, total = inventory_crud.list_transactions(db, product_id, page, page_size)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return InventoryTransactionListResponse(
        items=[
            InventoryTransactionRead(
                id=t.id, movement_type=t.movement_type, quantity_change=t.quantity_change,
                stock_before=t.stock_before, stock_after=t.stock_after, reason=t.reason,
                order_id=t.order_id, order_number=t.order.order_number if t.order else None,
                admin_name=t.admin.full_name if t.admin else None, created_at=t.created_at,
            )
            for t in items
        ],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


# --- Coupon management ---
@router.get("/coupons", response_model=CouponListResponse)
def admin_list_coupons(
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all coupons with search + pagination."""
    filters = coupon_crud.CouponFilters(search=search, is_active=is_active, page=page, page_size=page_size)
    items, total = coupon_crud.list_coupons(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return CouponListResponse(items=items, total=total, page=page, page_size=page_size, total_pages=total_pages)


@router.post("/coupons", response_model=CouponRead, status_code=status.HTTP_201_CREATED)
def admin_create_coupon(payload: CouponCreate, db: Session = Depends(get_db)):
    """Create a new coupon."""
    if coupon_crud.get_by_code(db, payload.code) is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A coupon with this code already exists")
    return coupon_crud.create(db, payload)


@router.put("/coupons/{coupon_id}", response_model=CouponRead)
def admin_update_coupon(coupon_id: uuid.UUID, payload: CouponUpdate, db: Session = Depends(get_db)):
    """Edit an existing coupon."""
    if payload.code is not None:
        existing = coupon_crud.get_by_code(db, payload.code)
        if existing is not None and existing.id != coupon_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A coupon with this code already exists")
    try:
        return coupon_crud.update(db, coupon_id, payload)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")


@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_coupon(coupon_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete a coupon."""
    try:
        coupon_crud.delete(db, coupon_id)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")


@router.post("/coupons/{coupon_id}/activate", response_model=CouponRead)
def admin_activate_coupon(coupon_id: uuid.UUID, db: Session = Depends(get_db)):
    """Activate a coupon."""
    try:
        return coupon_crud.set_active(db, coupon_id, True)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")


@router.post("/coupons/{coupon_id}/deactivate", response_model=CouponRead)
def admin_deactivate_coupon(coupon_id: uuid.UUID, db: Session = Depends(get_db)):
    """Deactivate a coupon."""
    try:
        return coupon_crud.set_active(db, coupon_id, False)
    except coupon_crud.CouponNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")


# --- Affiliate management ---
def _affiliate_admin_read(affiliate) -> AffiliateAdminRead:
    return AffiliateAdminRead(
        id=affiliate.id,
        affiliate_code=affiliate.affiliate_code,
        status=affiliate.status,
        commission_percentage=float(affiliate.commission_percentage),
        created_at=affiliate.created_at,
        approved_at=affiliate.approved_at,
        user_id=affiliate.user_id,
        full_name=affiliate.user.full_name,
        email=affiliate.user.email,
    )


@router.get("/affiliates", response_model=AffiliateListResponse)
def admin_list_affiliates(
    search: Optional[str] = None,
    status_filter: Optional[AffiliateStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List/search affiliates by name, email, or affiliate code."""
    filters = affiliate_crud.AffiliateFilters(search=search, status=status_filter, page=page, page_size=page_size)
    items, total = affiliate_crud.list_admin(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return AffiliateListResponse(
        items=[_affiliate_admin_read(a) for a in items], total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.post("/affiliates/{affiliate_id}/approve", response_model=AffiliateAdminRead)
def admin_approve_affiliate(affiliate_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        affiliate = affiliate_crud.set_status(db, affiliate_id, AffiliateStatus.APPROVED)
    except affiliate_crud.AffiliateNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate not found")
    return _affiliate_admin_read(affiliate)


@router.post("/affiliates/{affiliate_id}/reject", response_model=AffiliateAdminRead)
def admin_reject_affiliate(affiliate_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        affiliate = affiliate_crud.set_status(db, affiliate_id, AffiliateStatus.REJECTED)
    except affiliate_crud.AffiliateNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate not found")
    return _affiliate_admin_read(affiliate)


@router.post("/affiliates/{affiliate_id}/block", response_model=AffiliateAdminRead)
def admin_block_affiliate(affiliate_id: uuid.UUID, db: Session = Depends(get_db)):
    """Blocks the affiliate — their code stops earning new commissions (see
    crud/commission.py `attribute_order`, which re-checks status at every
    attribution) but past commissions are untouched."""
    try:
        affiliate = affiliate_crud.set_status(db, affiliate_id, AffiliateStatus.BLOCKED)
    except affiliate_crud.AffiliateNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate not found")
    return _affiliate_admin_read(affiliate)


@router.put("/affiliates/{affiliate_id}/commission", response_model=AffiliateAdminRead)
def admin_update_affiliate_commission(affiliate_id: uuid.UUID, payload: AffiliateCommissionUpdate, db: Session = Depends(get_db)):
    """Edit an affiliate's commission %. Only applies to future orders —
    already-created Commission rows snapshot their own percentage."""
    try:
        affiliate = affiliate_crud.set_commission_percentage(db, affiliate_id, payload.commission_percentage)
    except affiliate_crud.AffiliateNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate not found")
    return _affiliate_admin_read(affiliate)


@router.get("/affiliates/{affiliate_id}/orders", response_model=List[AttributedOrderSummary])
def admin_affiliate_attributed_orders(affiliate_id: uuid.UUID, db: Session = Depends(get_db)):
    """Orders attributed to this affiliate, with each order's commission status."""
    try:
        affiliate_crud.get(db, affiliate_id)
    except affiliate_crud.AffiliateNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate not found")

    results = []
    for order, commission in affiliate_crud.attributed_orders(db, affiliate_id):
        results.append(
            AttributedOrderSummary(
                order_id=order.id,
                order_number=order.order_number,
                order_status=order.status.value,
                total_amount=float(order.total_amount),
                commission_status=commission.status.value if commission else "pending",
                commission_amount=float(commission.amount) if commission else 0.0,
                created_at=order.created_at,
            )
        )
    return results


# --- Commission management (shared by affiliate referrals + influencer coupons) ---
@router.get("/commissions", response_model=CommissionListResponse)
def admin_list_commissions(
    affiliate_id: Optional[uuid.UUID] = None,
    status_filter: Optional[CommissionStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filters = commission_crud.CommissionFilters(affiliate_id=affiliate_id, status=status_filter, page=page, page_size=page_size)
    items, total = commission_crud.list_admin(db, filters)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return CommissionListResponse(
        items=[
            CommissionRead(
                id=c.id,
                source=c.source,
                affiliate_id=c.affiliate_id,
                coupon_id=c.coupon_id,
                order_id=c.order_id,
                order_number=c.order.order_number,
                percentage_applied=float(c.percentage_applied),
                amount=float(c.amount),
                status=c.status,
                created_at=c.created_at,
                earned_at=c.earned_at,
                paid_at=c.paid_at,
                reversed_at=c.reversed_at,
            )
            for c in items
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/commissions/{commission_id}/mark-paid", response_model=CommissionRead)
def admin_mark_commission_paid(commission_id: uuid.UUID, db: Session = Depends(get_db)):
    """Only EARNED commissions can be marked paid — PENDING ones are still
    inside the return-window hold, and PAID/REVERSED are already final."""
    try:
        commission = commission_crud.mark_paid(db, commission_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return CommissionRead(
        id=commission.id,
        source=commission.source,
        affiliate_id=commission.affiliate_id,
        coupon_id=commission.coupon_id,
        order_id=commission.order_id,
        order_number=commission.order.order_number,
        percentage_applied=float(commission.percentage_applied),
        amount=float(commission.amount),
        status=commission.status,
        created_at=commission.created_at,
        earned_at=commission.earned_at,
        paid_at=commission.paid_at,
        reversed_at=commission.reversed_at,
    )
