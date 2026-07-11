import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Search, Users, X, AlertCircle, MapPin, ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import * as adminService from "@/services/adminService";
import { formatCurrency } from "@/utils/formatCurrency";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import EmptyState from "@/components/common/EmptyState";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import type { CustomerDetail, CustomerListItem } from "@/types";

export default function AdminCustomersPage() {
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(search, 300);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminService
      .adminListCustomers({ search: debouncedSearch || undefined, page, page_size: 10 })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch(() => setError("Could not load customers. Please try again."))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  function openDetails(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    adminService
      .adminGetCustomer(id)
      .then(setDetail)
      .catch(() => setDetailError("Could not load customer details."))
      .finally(() => setDetailLoading(false));
  }

  function closeDetails() {
    setSelectedId(null);
    setDetail(null);
    setDetailError(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Customers</h1>
        <p className="text-sm text-brown-500">{total} registered customer{total === 1 ? "" : "s"}.</p>
      </div>

      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs mb-5">
        <Search className="w-4 h-4 text-brown-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
          placeholder="Search by name, email, or phone..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
        />
        {search && (
          <button onClick={() => setSearchParams({})} aria-label="Clear search">
            <X className="w-3.5 h-3.5 text-brown-500" />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setPage((p) => p)} className="text-xs font-semibold underline ml-auto shrink-0">Retry</button>
        </div>
      )}

      <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige text-left text-brown-500">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Purchase Value</th>
                <th className="px-5 py-3 font-medium">Registered</th>
                <th className="px-5 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            {!loading && (
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-forest-700">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brown-500">
                      <div>{c.email}</div>
                      <div className="text-xs">{c.phone}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.is_active ? "bg-pista-50 text-pista-700" : "bg-red-50 text-red-600"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-forest-700 font-medium">{c.order_count}</td>
                    <td className="px-5 py-3 text-forest-700 font-medium">{formatCurrency(c.total_purchase_value)}</td>
                    <td className="px-5 py-3 text-brown-500">
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openDetails(c.id)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700 inline-flex" aria-label="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
        {loading && <TableRowsSkeleton rows={5} cols={7} />}
        {!loading && items.length === 0 && (
          <div className="py-10">
            <EmptyState icon={Users} title="No customers found" description="Try a different search term." />
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-brown-500">Page {page} of {totalPages} · {total} customers</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-900/40" onClick={closeDetails} />
          <div className="relative bg-white rounded-3xl shadow-glass w-full max-w-lg p-6 animate-scale-in max-h-[85vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-pista-700" />
              </div>
            ) : detailError || !detail ? (
              <div>
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {detailError ?? "Customer not found."}
                </div>
                <button onClick={closeDetails} className="w-full rounded-full py-2.5 text-sm font-semibold bg-forest-700 text-white">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-forest-700 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                    {detail.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-forest-700 truncate">{detail.full_name}</h2>
                    <p className="text-xs text-brown-500 truncate">{detail.email} · {detail.phone}</p>
                  </div>
                  <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${detail.is_active ? "bg-pista-50 text-pista-700" : "bg-red-50 text-red-600"}`}>
                    {detail.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                  <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Total Orders</p><p className="font-semibold text-forest-700">{detail.order_count}</p></div>
                  <div className="rounded-xl bg-pista-50 p-3"><p className="text-xs text-brown-500">Total Purchase Value</p><p className="font-semibold text-forest-700">{formatCurrency(detail.total_purchase_value)}</p></div>
                  <div className="rounded-xl bg-pista-50 p-3 col-span-2">
                    <p className="text-xs text-brown-500">Registered</p>
                    <p className="font-semibold text-forest-700">
                      {new Date(detail.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-forest-700 mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Saved Addresses</h3>
                  {detail.addresses.length === 0 ? (
                    <p className="text-xs text-brown-500">No saved addresses.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.addresses.map((a) => (
                        <div key={a.id} className="rounded-xl bg-beige/40 p-3 text-xs text-brown-500 leading-relaxed">
                          <span className="font-medium text-forest-700">{a.full_name}</span>{a.is_default && <span className="ml-1.5 text-[10px] font-semibold text-pista-700">DEFAULT</span>}<br />
                          {a.house_no}, {a.street}{a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} - {a.pincode}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-forest-700 mb-2 flex items-center gap-1.5"><ShoppingBag className="w-4 h-4" /> Recent Orders</h3>
                  {detail.recent_orders.length === 0 ? (
                    <p className="text-xs text-brown-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.recent_orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-sm border-b border-beige/60 last:border-0 pb-2 last:pb-0">
                          <div>
                            <p className="font-medium text-forest-700">{o.order_number}</p>
                            <p className="text-[11px] text-brown-500">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mx-2" style={{ background: `${STATUS_COLOR[o.status]}1A`, color: STATUS_COLOR[o.status] }}>
                            {STATUS_LABEL[o.status]}
                          </span>
                          <span className="font-semibold text-forest-700 shrink-0">{formatCurrency(o.total_amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-forest-700 mb-2">Purchase History</h3>
                  {detail.purchase_history.length === 0 ? (
                    <p className="text-xs text-brown-500">No purchase history.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {detail.purchase_history.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-xs text-brown-500 border-b border-beige/60 last:border-0 pb-1.5 last:pb-0">
                          <span className="text-forest-700 font-medium">{o.order_number}</span>
                          <span>{o.item_count} item{o.item_count === 1 ? "" : "s"}</span>
                          <span>{STATUS_LABEL[o.status]}</span>
                          <span className="font-semibold text-forest-700">{formatCurrency(o.total_amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={closeDetails} className="w-full rounded-full py-2.5 text-sm font-semibold bg-forest-700 text-white">Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
