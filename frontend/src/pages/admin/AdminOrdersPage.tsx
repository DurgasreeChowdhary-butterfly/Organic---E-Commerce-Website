import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import OrderTable from "@/components/admin/OrderTable";
import { STATUS_LABEL } from "@/data/orders";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminFetchOrdersThunk,
  adminUpdateOrderStatusThunk,
  adminCancelOrderThunk,
  adminRefundOrderThunk,
  clearAdminOrdersError,
} from "@/features/orders/ordersSlice";
import { useDebounce } from "@/hooks/useDebounce";
import type { OrderStatus } from "@/types";

const FILTERS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const { adminItems: orders, adminTotal, adminPage, adminTotalPages, adminStatus, adminError, adminMutatingId } = useAppSelector((s) => s.orders);
  const loading = adminStatus === "loading" || adminStatus === "idle";

  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    dispatch(
      adminFetchOrdersThunk({
        search: debouncedSearch || undefined,
        status: filter === "all" ? undefined : filter,
        page,
        page_size: 20,
      })
    );
  }, [dispatch, debouncedSearch, filter, page]);

  function handleStatusChange(id: string, status: OrderStatus) {
    dispatch(adminUpdateOrderStatusThunk({ orderId: id, status }));
  }

  function handleCancel(id: string) {
    dispatch(adminCancelOrderThunk({ orderId: id }));
  }

  function handleRefund(id: string) {
    dispatch(adminRefundOrderThunk({ orderId: id }));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Orders</h1>
        <p className="text-sm text-brown-500">View and manage all customer orders.</p>
      </div>

      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs mb-5">
        <Search className="w-4 h-4 text-brown-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
          placeholder="Search by order #, name, or email..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
        />
        {search && (
          <button onClick={() => setSearchParams({})} aria-label="Clear search">
            <X className="w-3.5 h-3.5 text-brown-500" />
          </button>
        )}
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

      {adminError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {adminError}
          <button onClick={() => dispatch(clearAdminOrdersError())} className="text-xs font-semibold underline ml-auto shrink-0">Dismiss</button>
        </div>
      )}

      <OrderTable
        orders={orders}
        onStatusChange={handleStatusChange}
        onCancel={handleCancel}
        onRefund={handleRefund}
        mutatingId={adminMutatingId}
        loading={loading}
      />

      {!loading && adminTotalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={adminPage <= 1}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-brown-500">Page {adminPage} of {adminTotalPages} · {adminTotal} orders</span>
          <button
            onClick={() => setPage((p) => Math.min(adminTotalPages, p + 1))}
            disabled={adminPage >= adminTotalPages}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
