import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Download, Leaf, MapPin, SearchX, AlertCircle, RotateCcw, XCircle, Loader2, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { STATUS_LABEL, STATUS_COLOR, STATUS_FLOW } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { downloadInvoice } from "@/services/orderService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderThunk, cancelOrderThunk, reorderThunk, clearOrderDetailError, clearReorderSkipped } from "@/features/orders/ordersSlice";

const CANCELLABLE_STATUSES = new Set(["pending", "confirmed", "packed"]);
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

function orderSupportWhatsAppLink(orderNumber: string) {
  const text = `Hi, I need help with my order ${orderNumber}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, detailStatus, detailError, mutatingOrderId, reorderSkipped } = useAppSelector((s) => s.orders);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (orderId) dispatch(fetchOrderThunk(orderId));
    dispatch(clearReorderSkipped());
  }, [dispatch, orderId]);

  const loading = detailStatus === "idle" || detailStatus === "loading";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState icon={SearchX} title="Order not found" description="We couldn't find this order. It may have been removed." />
      </div>
    );
  }

  const isFinal = order.status === "cancelled" || order.status === "refunded";
  const isCancellable = CANCELLABLE_STATUSES.has(order.status);
  const busy = mutatingOrderId === order.id;

  async function handleDownloadInvoice() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadInvoice(order!.id, order!.order_number);
    } catch {
      setDownloadError("Could not download the invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleCancel() {
    dispatch(cancelOrderThunk({ orderId: order!.id }));
    setShowCancelConfirm(false);
  }

  function handleReorder() {
    dispatch(reorderThunk(order!.id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Orders", to: "/orders" }, { label: order.order_number }]} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-700">{order.order_number}</h1>
          <p className="text-xs text-brown-500">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isFinal && (
            <button
              onClick={handleReorder}
              disabled={busy}
              className="flex items-center gap-1.5 text-sm font-semibold text-forest-700 border-2 border-beige rounded-full px-4 py-2 hover:border-pista-500 transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Reorder
            </button>
          )}
          {isCancellable && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={busy}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 border-2 border-beige rounded-full px-4 py-2 hover:border-red-300 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-1.5 text-sm font-semibold text-forest-700 border-2 border-beige rounded-full px-4 py-2 hover:border-pista-500 transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Invoice
          </button>
        </div>
      </div>

      {detailError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{detailError}</span>
          <button onClick={() => dispatch(clearOrderDetailError())} className="text-xs font-semibold underline shrink-0">Dismiss</button>
        </div>
      )}
      {downloadError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{downloadError}</span>
        </div>
      )}
      {reorderSkipped.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-soft-orange/10 text-soft-orange text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            Added to cart, but {reorderSkipped.join(", ")} {reorderSkipped.length === 1 ? "is" : "are"} no longer available.
          </span>
          <button onClick={() => navigate("/cart")} className="text-xs font-semibold underline shrink-0">View Cart</button>
        </div>
      )}

      {/* Timeline */}
      {!isFinal ? (
        <div className="rounded-3xl bg-white shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((step, i) => {
              const historyEntry = order.status_history.find((h) => h.status === step);
              const done = !!historyEntry;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${order.status_history.some((h) => h.status === STATUS_FLOW[i - 1]) ? "bg-pista-700" : "bg-beige"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${done ? "bg-pista-700" : "bg-beige"}`}>
                    {done && <Check className="w-4 h-4" />}
                  </div>
                  <span className={`text-[11px] font-medium mt-2 text-center ${done ? "text-forest-700" : "text-brown-500"}`}>{STATUS_LABEL[step]}</span>
                  {historyEntry && (
                    <span className="text-[10px] text-brown-500">
                      {new Date(historyEntry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-5 mb-6" style={{ background: `${STATUS_COLOR[order.status]}12` }}>
          <span className="text-sm font-semibold" style={{ color: STATUS_COLOR[order.status] }}>
            This order was {STATUS_LABEL[order.status].toLowerCase()}{order.cancel_reason ? ` — ${order.cancel_reason}` : ""}.
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl bg-white shadow-soft p-6">
          <h2 className="font-semibold text-forest-700 mb-4">Items ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-pista-50">
                  <Leaf className="w-5 h-5 text-pista-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-forest-700 line-clamp-1">{item.product_name}</p>
                  <p className="text-xs text-brown-500">SKU: {item.sku} · Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-forest-700">{formatCurrency(item.line_total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Delivery Address</h2>
            <p className="text-xs text-brown-500 leading-relaxed">
              {order.address.full_name}<br />
              {order.address.house_no}, {order.address.street}{order.address.landmark && `, ${order.address.landmark}`}, {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>

          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-3">Bill Details</h2>
            <div className="space-y-2 text-sm text-brown-500">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-pista-700"><span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
              <div className="flex justify-between"><span>GST</span><span>{formatCurrency(order.gst_amount)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</span></div>
            </div>
            <div className="border-t border-beige my-3" />
            <div className="flex justify-between font-semibold text-forest-700"><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
            {order.razorpay_payment_id && (
              <p className="text-[10px] text-brown-500 mt-3">Payment Ref: {order.razorpay_payment_id}</p>
            )}
          </div>

          <a
            href={orderSupportWhatsAppLink(order.order_number)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-3xl bg-[#25D366]/10 shadow-soft p-5 hover:bg-[#25D366]/15 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 fill-[#25D366]" />
            <div>
              <p className="text-sm font-semibold text-forest-700">Need help with this order?</p>
              <p className="text-xs text-brown-500">Chat with support on WhatsApp</p>
            </div>
          </a>
        </div>
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this order?"
        description={`"${order.order_number}" will be cancelled and any reserved stock will be released.`}
        confirmLabel="Cancel Order"
        loading={busy}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
