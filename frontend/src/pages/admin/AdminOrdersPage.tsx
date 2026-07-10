import { useMemo, useState } from "react";
import OrderTable from "@/components/admin/OrderTable";
import { STATUS_LABEL } from "@/data/orders";
import { ADMIN_ORDERS } from "@/data/admin";
import { useLoading } from "@/hooks/useLoading";
import type { OrderStatus } from "@/types";

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState(ADMIN_ORDERS);
  const loading = useLoading(300);

  const filtered = useMemo(() => (filter === "all" ? orders : orders.filter((o) => o.status === filter)), [orders, filter]);

  function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Orders</h1>
        <p className="text-sm text-brown-500">View and manage all customer orders.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
              filter === f ? "bg-forest-700 text-white" : "bg-white text-brown-500 hover:bg-pista-50"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <OrderTable orders={filtered} onStatusChange={handleStatusChange} loading={loading} />
    </div>
  );
}
