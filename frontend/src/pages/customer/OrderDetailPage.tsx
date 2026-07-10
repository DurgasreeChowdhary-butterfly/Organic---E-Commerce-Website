import { useParams, Link } from "react-router-dom";
import { Check, Download, Leaf, MapPin, SearchX } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { downloadInvoice } from "@/utils/downloadInvoice";
import { useAppSelector } from "@/store/hooks";
import { useLoading } from "@/hooks/useLoading";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const order = useAppSelector((s) => s.orders.items.find((o) => o.id === orderId));
  const loading = useLoading(300);

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

  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Orders", to: "/orders" }, { label: order.order_number }]} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-forest-700">{order.order_number}</h1>
          <p className="text-xs text-brown-500">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button
          onClick={() => downloadInvoice(order)}
          className="flex items-center gap-1.5 text-sm font-semibold text-forest-700 border-2 border-beige rounded-full px-4 py-2 hover:border-pista-500 transition-colors"
        >
          <Download className="w-4 h-4" /> Download Invoice
        </button>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="rounded-3xl bg-white shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between">
            {order.timeline.map((step, i) => (
              <div key={step.status} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${order.timeline[i - 1].done ? "bg-pista-700" : "bg-beige"}`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${step.done ? "bg-pista-700" : "bg-beige"}`}>
                  {step.done && <Check className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] font-medium mt-2 text-center ${step.done ? "text-forest-700" : "text-brown-500"}`}>{STATUS_LABEL[step.status]}</span>
                {step.date && <span className="text-[10px] text-brown-500">{step.date}</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-5 mb-6" style={{ background: `${STATUS_COLOR[order.status]}12` }}>
          <span className="text-sm font-semibold" style={{ color: STATUS_COLOR[order.status] }}>
            This order was {STATUS_LABEL[order.status].toLowerCase()}.
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl bg-white shadow-soft p-6">
          <h2 className="font-semibold text-forest-700 mb-4">Items ({order.items.length})</h2>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.product.tint}22` }}>
                  <Leaf className="w-5 h-5" style={{ color: item.product.tint }} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`} className="text-sm font-medium text-forest-700 hover:text-pista-700 line-clamp-1">{item.product.name}</Link>
                  <p className="text-xs text-brown-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-forest-700">{formatCurrency((item.product.discount_price ?? item.product.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Delivery Address</h2>
            <p className="text-xs text-brown-500 leading-relaxed">
              {order.address.line1}, {order.address.line2 && `${order.address.line2}, `}{order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>

          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-3">Bill Details</h2>
            <div className="space-y-2 text-sm text-brown-500">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-pista-700"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between"><span>GST</span><span>{formatCurrency(order.gst)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
            </div>
            <div className="border-t border-beige my-3" />
            <div className="flex justify-between font-semibold text-forest-700"><span>Total</span><span>{formatCurrency(order.total_amount)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
