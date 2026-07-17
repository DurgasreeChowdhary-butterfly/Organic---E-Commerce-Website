import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import AffiliateTable from "@/components/admin/AffiliateTable";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminApproveAffiliateThunk, adminBlockAffiliateThunk, adminFetchAffiliatesThunk, adminFetchCommissionsThunk,
  adminMarkCommissionPaidThunk, adminRejectAffiliateThunk, adminUpdateAffiliateCommissionThunk,
  clearAdminAffiliateError,
} from "@/features/affiliate/affiliateSlice";
import { adminGetAffiliateOrders } from "@/services/adminService";
import type { AffiliateAdmin, AffiliateStatus, AttributedOrderSummary, CommissionStatus } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_FILTERS: { label: string; value: AffiliateStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Blocked", value: "blocked" },
];

export default function AdminAffiliatesPage() {
  const dispatch = useAppDispatch();
  const {
    adminItems: affiliates, adminTotal, adminPage, adminTotalPages, adminStatus, adminError,
    adminCommissions, adminCommissionsTotal, adminCommissionsStatus,
  } = useAppSelector((s) => s.affiliate);
  const loading = adminStatus === "loading" || adminStatus === "idle";

  const [tab, setTab] = useState<"affiliates" | "commissions">("affiliates");
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "">("");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<CommissionStatus | "">("");

  const [ordersModalAffiliate, setOrdersModalAffiliate] = useState<AffiliateAdmin | null>(null);
  const [ordersModalData, setOrdersModalData] = useState<AttributedOrderSummary[]>([]);
  const [ordersModalLoading, setOrdersModalLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (tab === "affiliates") {
      dispatch(
        adminFetchAffiliatesThunk({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, page_size: 10 })
      );
    }
  }, [dispatch, tab, debouncedSearch, statusFilter, page]);

  useEffect(() => {
    if (tab === "commissions") {
      dispatch(adminFetchCommissionsThunk({ status: commissionStatusFilter || undefined, page: 1, page_size: 50 }));
    }
  }, [dispatch, tab, commissionStatusFilter]);

  async function handleViewOrders(affiliate: AffiliateAdmin) {
    setOrdersModalAffiliate(affiliate);
    setOrdersModalLoading(true);
    try {
      const data = await adminGetAffiliateOrders(affiliate.id);
      setOrdersModalData(data);
    } finally {
      setOrdersModalLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Affiliates</h1>
          <p className="text-sm text-brown-500">Approve affiliates, manage commission %, and pay out earnings.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setTab("affiliates")}
          className={`text-sm font-semibold px-4 py-2 rounded-full ${tab === "affiliates" ? "bg-forest-700 text-white" : "bg-white text-forest-700 shadow-soft"}`}
        >
          Affiliates
        </button>
        <button
          onClick={() => setTab("commissions")}
          className={`text-sm font-semibold px-4 py-2 rounded-full ${tab === "commissions" ? "bg-forest-700 text-white" : "bg-white text-forest-700 shadow-soft"}`}
        >
          Commissions
        </button>
      </div>

      {tab === "affiliates" && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs">
              <Search className="w-4 h-4 text-brown-500 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
                placeholder="Search name, email, or code..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
              />
              {search && (
                <button onClick={() => setSearchParams({})} aria-label="Clear search">
                  <X className="w-3.5 h-3.5 text-brown-500" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AffiliateStatus | "")}
              className="rounded-full px-4 py-2.5 bg-white shadow-soft text-sm outline-none"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {adminError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {adminError}
              <button onClick={() => dispatch(clearAdminAffiliateError())} className="ml-auto text-xs underline">Dismiss</button>
            </div>
          )}

          <AffiliateTable
            affiliates={affiliates}
            loading={loading}
            onApprove={(a) => dispatch(adminApproveAffiliateThunk(a.id))}
            onReject={(a) => dispatch(adminRejectAffiliateThunk(a.id))}
            onBlock={(a) => dispatch(adminBlockAffiliateThunk(a.id))}
            onSaveCommission={(a, pct) => dispatch(adminUpdateAffiliateCommissionThunk({ id: a.id, commissionPercentage: pct }))}
            onViewOrders={handleViewOrders}
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
              <span className="text-sm text-brown-500">Page {adminPage} of {adminTotalPages} · {adminTotal} affiliates</span>
              <button
                onClick={() => setPage((p) => Math.min(adminTotalPages, p + 1))}
                disabled={adminPage >= adminTotalPages}
                className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {tab === "commissions" && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <select
              value={commissionStatusFilter}
              onChange={(e) => setCommissionStatusFilter(e.target.value as CommissionStatus | "")}
              className="rounded-full px-4 py-2.5 bg-white shadow-soft text-sm outline-none"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="earned">Earned</option>
              <option value="paid">Paid</option>
              <option value="reversed">Reversed</option>
            </select>
            <span className="text-sm text-brown-500">{adminCommissionsTotal} commissions</span>
          </div>

          <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-beige text-left text-brown-500">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 font-medium">%</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                {adminCommissionsStatus !== "loading" && (
                  <tbody>
                    {adminCommissions.map((c) => (
                      <tr key={c.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                        <td className="px-5 py-3 font-medium text-forest-700">{c.order_number}</td>
                        <td className="px-5 py-3 text-brown-500 capitalize">{c.source.replace(/_/g, " ")}</td>
                        <td className="px-5 py-3 text-brown-500">{c.percentage_applied}%</td>
                        <td className="px-5 py-3 text-brown-500">{formatCurrency(c.amount)}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-pista-50 text-pista-700">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {c.status === "earned" && (
                            <button
                              onClick={() => dispatch(adminMarkCommissionPaidThunk(c.id))}
                              className="text-xs font-semibold text-pista-700 hover:underline"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            {adminCommissions.length === 0 && adminCommissionsStatus !== "loading" && (
              <p className="text-center text-sm text-brown-500 py-10">No commissions found.</p>
            )}
          </div>
        </>
      )}

      <Modal
        open={!!ordersModalAffiliate}
        onClose={() => setOrdersModalAffiliate(null)}
        title={`Attributed Orders — ${ordersModalAffiliate?.affiliate_code ?? ""}`}
      >
        {ordersModalLoading ? (
          <p className="text-sm text-brown-500">Loading...</p>
        ) : ordersModalData.length === 0 ? (
          <p className="text-sm text-brown-500">No orders attributed to this affiliate yet.</p>
        ) : (
          <div className="space-y-2">
            {ordersModalData.map((o) => (
              <div key={o.order_id} className="flex items-center justify-between rounded-xl border border-beige px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-forest-700">{o.order_number}</p>
                  <p className="text-xs text-brown-500 capitalize">{o.order_status.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-forest-700">{formatCurrency(o.total_amount)}</p>
                  <p className="text-xs text-brown-500 capitalize">{formatCurrency(o.commission_amount)} ({o.commission_status})</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button fullWidth variant="outline" className="mt-4" onClick={() => setOrdersModalAffiliate(null)}>Close</Button>
      </Modal>
    </div>
  );
}
