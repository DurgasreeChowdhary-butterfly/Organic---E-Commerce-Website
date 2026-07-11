"""
Customer order history, tracking, invoice, cancellation, and reorder endpoints.

Orders are created automatically by the payment verification flow (see
payments.py) — there is no manual "place order" endpoint here.
"""
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import cart as cart_crud
from app.crud import order as order_crud
from app.db.session import get_db
from app.models.user import User
from app.schemas.cart import CartItemRead, CartRead
from app.schemas.order import (
    OrderListItemRead,
    OrderListResponse,
    OrderCancelRequest,
    OrderRead,
    ReorderResponse,
)
from app.services.invoice_service import generate_invoice_pdf

router = APIRouter()


def _serialize_order(order) -> OrderRead:
    return OrderRead(
        id=order.id,
        order_number=order.order_number,
        status=order.status,
        subtotal=float(order.subtotal),
        discount_amount=float(order.discount_amount),
        gst_amount=float(order.gst_amount),
        shipping_fee=float(order.shipping_fee),
        total_amount=float(order.total_amount),
        coupon_code=order.coupon.code if order.coupon else None,
        razorpay_order_id=order.razorpay_order_id,
        razorpay_payment_id=order.razorpay_payment_id,
        cancel_reason=order.cancel_reason,
        cancelled_at=order.cancelled_at,
        refunded_at=order.refunded_at,
        created_at=order.created_at,
        items=order.items,
        address=order.address,
        status_history=order.status_history,
    )


@router.get("/", response_model=OrderListResponse)
def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's order history, most recent first."""
    items, total = order_crud.list_for_user(db, current_user.id, page, page_size)
    total_pages = max((total + page_size - 1) // page_size, 1)
    return OrderListResponse(
        items=[
            OrderListItemRead(
                id=o.id, order_number=o.order_number, status=o.status, total_amount=float(o.total_amount),
                item_count=sum(i.quantity for i in o.items), created_at=o.created_at,
            )
            for o in items
        ],
        total=total, page=page, page_size=page_size, total_pages=total_pages,
    )


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get a single order with items, address, and status timeline."""
    try:
        order = order_crud.get_for_user(db, current_user.id, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _serialize_order(order)


@router.get("/{order_id}/invoice")
def download_invoice(order_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Download a GST invoice PDF for this order."""
    try:
        order = order_crud.get_for_user(db, current_user.id, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    pdf_bytes = generate_invoice_pdf(order)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{order.order_number}-invoice.pdf"'},
    )


@router.post("/{order_id}/cancel", response_model=OrderRead)
def cancel_order(
    order_id: uuid.UUID,
    payload: OrderCancelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an order — only allowed before it has shipped. Restocks items."""
    try:
        order = order_crud.get_for_user(db, current_user.id, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    try:
        order = order_crud.cancel(db, order, payload.reason)
    except order_crud.OrderCannotBeCancelled as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return _serialize_order(order)


@router.post("/{order_id}/reorder", response_model=ReorderResponse)
def reorder(order_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add this order's items back into the current cart, skipping anything
    no longer available, and return the updated cart plus what was skipped."""
    try:
        order = order_crud.get_for_user(db, current_user.id, order_id)
    except order_crud.OrderNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    cart, skipped = order_crud.reorder(db, order, current_user.id)
    items = [
        CartItemRead(id=item.id, product=item.product, quantity=item.quantity, **cart_crud.line_values(item))
        for item in cart.items
    ]
    summary = cart_crud.summarize(cart)
    cart_read = CartRead(items=items, item_count=sum(i.quantity for i in cart.items), **summary)
    return ReorderResponse(cart=cart_read, skipped=skipped)
