import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PackageSearch, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrdersThunk, clearOrdersError } from "@/features/orders/ordersSlice";

export default function OrderHistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: orders, status, error, page, totalPages } = useAppSelector((s) => s.orders);
  const loading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchOrdersThunk({ page: 1, page_size: 10 }));
  }, [dispatch]);

  function goToPage(nextPage: number) {
    dispatch(fetchOrdersThunk({ page: nextPage, page_size: 10 }));
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8 space-y-2.5 sm:space-y-4">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 sm:h-28 rounded-3xl" />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => { dispatch(clearOrdersError()); dispatch(fetchOrdersThunk({ page: 1, page_size: 10 })); }} className="text-xs font-semibold underline shrink-0">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={PackageSearch} title="No orders yet" description="Once you place an order, you'll be able to track it here." actionLabel="Start Shopping" onAction={() => navigate("/products")} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Orders" }]} />
      <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mb-3 sm:mb-6">My Orders</h1>

      <div className="space-y-2.5 sm:space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block rounded-3xl bg-white shadow-soft p-3.5 sm:p-5 hover:shadow-glass active:scale-[0.99] transition-all animate-fade-up"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <p className="font-semibold text-forest-700 text-sm sm:text-base">{order.order_number}</p>
                <p className="text-xs text-brown-500">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-brown-500" />
            </div>
            <p className="text-xs sm:text-sm text-brown-500 mb-2 sm:mb-3">{order.item_count} item{order.item_count > 1 ? "s" : ""}</p>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: `${STATUS_COLOR[order.status]}1A`, color: STATUS_COLOR[order.status] }}
              >
                {STATUS_LABEL[order.status]}
              </span>
              <span className="font-semibold text-forest-700 text-sm sm:text-base">{formatCurrency(order.total_amount)}</span>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-brown-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
