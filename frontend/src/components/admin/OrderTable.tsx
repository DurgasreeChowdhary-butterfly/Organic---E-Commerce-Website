import { FileText } from "lucide-react";
import { STATUS_LABEL, STATUS_COLOR, type DummyOrder } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { downloadInvoice } from "@/utils/downloadInvoice";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import type { OrderStatus } from "@/types";

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

interface OrderTableProps {
  orders: DummyOrder[];
  onStatusChange: (id: string, status: OrderStatus) => void;
  loading?: boolean;
}

/** Admin order management table with inline status updates (dummy, non-persistent). */
export default function OrderTable({ orders, onStatusChange, loading }: OrderTableProps) {
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Invoice</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                  <td className="px-5 py-3 font-medium text-forest-700">{o.order_number}</td>
                  <td className="px-5 py-3 text-brown-500">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-5 py-3 text-brown-500">{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                  <td className="px-5 py-3 font-medium text-forest-700">{formatCurrency(o.total_amount)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
                      style={{ color: STATUS_COLOR[o.status] }}
                      className="text-xs font-semibold rounded-full px-2.5 py-1.5 bg-beige/50 outline-none cursor-pointer"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => downloadInvoice(o)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700 inline-flex" aria-label="Download invoice">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {loading && <TableRowsSkeleton rows={5} cols={6} />}
      {!loading && orders.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No orders match this filter.</p>}
    </div>
  );
}
