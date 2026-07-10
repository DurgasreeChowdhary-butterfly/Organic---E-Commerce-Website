"""
Admin-only endpoints: dashboard stats, product/category/order/customer/inventory management.
All routes here must be protected by get_current_active_admin.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_active_admin

router = APIRouter(dependencies=[Depends(get_current_active_admin)])


# --- Dashboard ---
@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Revenue, orders, customers, products, sales, low-stock summary. TODO: implement."""
    raise NotImplementedError


# --- Product management ---
@router.post("/products")
def admin_create_product(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.put("/products/{product_id}")
def admin_update_product(product_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.delete("/products/{product_id}")
def admin_delete_product(product_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.post("/products/{product_id}/images")
def admin_upload_product_images(product_id: str, db: Session = Depends(get_db)):
    """Upload multiple product images. TODO: implement (S3/cloud storage)."""
    raise NotImplementedError


# --- Category management ---
@router.post("/categories")
def admin_create_category(db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.put("/categories/{category_id}")
def admin_update_category(category_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


@router.delete("/categories/{category_id}")
def admin_delete_category(category_id: str, db: Session = Depends(get_db)):
    """TODO: implement."""
    raise NotImplementedError


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
