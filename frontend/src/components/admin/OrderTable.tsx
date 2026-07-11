import { useState } from "react";
import { Download, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { downloadInvoice } from "@/services/orderService";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminOrderListItem, OrderStatus } from "@/types";

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];
const TERMINAL_STATUSES = new Set<OrderStatus>(["cancelled", "refunded"]);

interface OrderTableProps {
  orders: AdminOrderListItem[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  onCancel: (id: string) => void;
  onRefund: (id: string) => void;
  mutatingId: string | null;
  loading?: boolean;
}

/** Admin order management table with inline status updates, cancel, refund, and invoice download. */
export default function OrderTable({ orders, onStatusChange, onCancel, onRefund, mutatingId, loading }: OrderTableProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<AdminOrderListItem | null>(null);

  async function handleDownload(order: AdminOrderListItem) {
    setDownloadingId(order.id);
    try {
      await downloadInvoice(order.id, order.order_number, `/admin/orders/${order.id}/invoice`);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {orders.map((o) => {
                const busy = mutatingId === o.id;
                const isTerminal = TERMINAL_STATUSES.has(o.status);
                return (
                  <tr key={o.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                    <td className="px-5 py-3 font-medium text-forest-700">{o.order_number}</td>
                    <td className="px-5 py-3 text-brown-500">
                      <div>{o.customer_name}</div>
                      <div className="text-[11px]">{o.customer_email}</div>
                    </td>
                    <td className="px-5 py-3 text-brown-500">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="px-5 py-3 text-brown-500">{o.item_count} item{o.item_count > 1 ? "s" : ""}</td>
                    <td className="px-5 py-3 font-medium text-forest-700">{formatCurrency(o.total_amount)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                        disabled={busy || isTerminal}
                        style={{ color: STATUS_COLOR[o.status] }}
                        className="text-xs font-semibold rounded-full px-2.5 py-1.5 bg-beige/50 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {busy ? (
                          <Loader2 className="w-4 h-4 animate-spin text-brown-500 mr-1" />
                        ) : (
                          <>
                            {!isTerminal && (
                              <button onClick={() => onCancel(o.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Cancel order" title="Cancel">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            {o.status !== "refunded" && (
                              <button onClick={() => setRefundTarget(o)} className="p-2 rounded-lg hover:bg-soft-orange/10 text-soft-orange" aria-label="Refund order" title="Refund">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleDownload(o)}
                          disabled={downloadingId === o.id}
                          className="p-2 rounded-lg hover:bg-pista-50 text-forest-700 inline-flex disabled:opacity-50"
                          aria-label="Download invoice"
                          title="Download invoice"
                        >
                          {downloadingId === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {loading && <TableRowsSkeleton rows={5} cols={7} />}
      {!loading && orders.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No orders match this filter.</p>}

      <ConfirmDialog
        open={!!refundTarget}
        title="Refund this order?"
        description={`This will refund "${refundTarget?.order_number}" via Razorpay and mark it as refunded.`}
        confirmLabel="Refund"
        onConfirm={() => { if (refundTarget) onRefund(refundTarget.id); setRefundTarget(null); }}
        onCancel={() => setRefundTarget(null)}
      />
    </div>
  );
}
