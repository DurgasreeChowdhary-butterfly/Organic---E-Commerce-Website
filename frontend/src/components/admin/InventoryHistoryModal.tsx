import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import type { InventoryItem, InventoryTransaction, MovementType } from "@/types";

const MOVEMENT_LABEL: Record<MovementType, string> = {
  order: "Order Placed",
  order_cancelled: "Order Cancelled",
  manual_increase: "Manual Increase",
  manual_decrease: "Manual Decrease",
  correction: "Stock Correction",
  refund_restock: "Refund Restock",
};

interface InventoryHistoryModalProps {
  open: boolean;
  item: InventoryItem | null;
  transactions: InventoryTransaction[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

/** Read-only audit trail of every stock movement for a single product. */
export default function InventoryHistoryModal({
  open, item, transactions, loading, error, page, totalPages, onPageChange, onClose,
}: InventoryHistoryModalProps) {
  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Stock History — ${item.name}`} maxWidth="max-w-2xl">
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-brown-500 py-6 text-center">No stock movements recorded yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.map((t) => {
            const isIncrease = t.quantity_change > 0;
            return (
              <div key={t.id} className="flex items-start gap-3 border-b border-beige/60 last:border-0 py-3">
                {isIncrease ? (
                  <ArrowUpCircle className="w-5 h-5 text-pista-700 shrink-0 mt-0.5" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-forest-700">{MOVEMENT_LABEL[t.movement_type]}</span>
                    <span className={`text-sm font-semibold shrink-0 ${isIncrease ? "text-pista-700" : "text-red-600"}`}>
                      {isIncrease ? "+" : ""}{t.quantity_change}
                    </span>
                  </div>
                  <p className="text-xs text-brown-500">
                    {t.stock_before} → {t.stock_after} stock
                    {t.order_number && ` · Order ${t.order_number}`}
                    {t.admin_name && ` · by ${t.admin_name}`}
                  </p>
                  {t.reason && <p className="text-xs text-brown-500 italic mt-0.5">"{t.reason}"</p>}
                  <p className="text-[10px] text-brown-500 mt-0.5">
                    {new Date(t.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-beige">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 text-xs font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-xs text-brown-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 text-xs font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Modal>
  );
}
