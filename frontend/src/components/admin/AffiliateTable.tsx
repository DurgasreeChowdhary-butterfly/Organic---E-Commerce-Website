import { useState } from "react";
import { Check, X, Ban, ClipboardList } from "lucide-react";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import type { AffiliateAdmin } from "@/types";

interface AffiliateTableProps {
  affiliates: AffiliateAdmin[];
  onApprove: (a: AffiliateAdmin) => void;
  onReject: (a: AffiliateAdmin) => void;
  onBlock: (a: AffiliateAdmin) => void;
  onSaveCommission: (a: AffiliateAdmin, percentage: number) => void;
  onViewOrders: (a: AffiliateAdmin) => void;
  loading?: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold/20 text-brown-700",
  approved: "bg-pista-50 text-pista-700",
  rejected: "bg-red-50 text-red-600",
  blocked: "bg-beige text-brown-500",
};

function CommissionCell({ affiliate, onSave }: { affiliate: AffiliateAdmin; onSave: (pct: number) => void }) {
  const [value, setValue] = useState(String(affiliate.commission_percentage));
  const dirty = Number(value) !== affiliate.commission_percentage;

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0.01}
        max={100}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-lg border border-beige px-2 py-1 text-sm outline-none focus:border-pista-500"
      />
      <span className="text-xs text-brown-500">%</span>
      {dirty && (
        <button
          onClick={() => onSave(Number(value))}
          className="text-xs font-semibold text-pista-700 hover:underline"
        >
          Save
        </button>
      )}
    </div>
  );
}

/** Admin affiliate management table: approve/reject/block, edit commission %, view attributed orders. */
export default function AffiliateTable({
  affiliates, onApprove, onReject, onBlock, onSaveCommission, onViewOrders, loading,
}: AffiliateTableProps) {
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Affiliate</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Commission %</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                  <td className="px-5 py-3 font-medium text-forest-700">{a.affiliate_code}</td>
                  <td className="px-5 py-3 text-brown-500">
                    <div className="text-forest-700 font-medium">{a.full_name}</div>
                    <div className="text-xs">{a.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <CommissionCell affiliate={a} onSave={(pct) => onSaveCommission(a, pct)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onViewOrders(a)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700" aria-label="View orders" title="View attributed orders">
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      {a.status !== "approved" && (
                        <button onClick={() => onApprove(a)} className="p-2 rounded-lg hover:bg-pista-50 text-pista-700" aria-label="Approve" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === "pending" && (
                        <button onClick={() => onReject(a)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Reject" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {a.status !== "blocked" && (
                        <button onClick={() => onBlock(a)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Block" title="Block">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {loading && <TableRowsSkeleton rows={5} cols={5} />}
      {!loading && affiliates.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No affiliates found.</p>}
    </div>
  );
}
