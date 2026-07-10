import { Link } from "react-router-dom";
import { PackageSearch, ChevronRight } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import { ORDERS, STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";

export default function OrderHistoryPage() {
  if (ORDERS.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={PackageSearch} title="No orders yet" description="Once you place an order, you'll be able to track it here." actionLabel="Start Shopping" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">My Orders</h1>

      <div className="space-y-4">
        {ORDERS.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block rounded-3xl bg-white shadow-soft p-5 hover:shadow-glass transition-shadow animate-fade-up"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-forest-700">{order.order_number}</p>
                <p className="text-xs text-brown-500">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-brown-500" />
            </div>
            <p className="text-sm text-brown-500 mb-3">
              {order.items.map((i) => i.product.name).join(", ")}
            </p>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: `${STATUS_COLOR[order.status]}1A`, color: STATUS_COLOR[order.status] }}
              >
                {STATUS_LABEL[order.status]}
              </span>
              <span className="font-semibold text-forest-700">{formatCurrency(order.total_amount)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
