import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import type { Coupon } from "@/types";

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleActive: (coupon: Coupon) => void;
  loading?: boolean;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discount_type === "flat") return `${formatCurrency(coupon.discount_value)} off`;
  const cap = coupon.max_discount ? ` (up to ${formatCurrency(coupon.max_discount)})` : "";
  return `${coupon.discount_value}% off${cap}`;
}

function isExpired(coupon: Coupon): boolean {
  return !!coupon.valid_until && new Date(coupon.valid_until) < new Date();
}

/** Admin coupon management table with activate/deactivate/edit/delete actions. */
export default function CouponTable({ coupons, onEdit, onDelete, onToggleActive, loading }: CouponTableProps) {
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Min Order</th>
              <th className="px-5 py-3 font-medium">Usage</th>
              <th className="px-5 py-3 font-medium">Valid Until</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {coupons.map((c) => {
                const expired = isExpired(c);
                return (
                  <tr key={c.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                    <td className="px-5 py-3 font-medium text-forest-700">
                      {c.code}
                      {c.is_influencer && (
                        <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold/20 text-brown-700 align-middle">
                          Influencer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brown-500">{formatDiscount(c)}</td>
                    <td className="px-5 py-3 text-brown-500">{formatCurrency(c.min_order_value)}</td>
                    <td className="px-5 py-3 text-brown-500">
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                      {c.per_user_limit ? <span className="text-[11px] block">{c.per_user_limit}/user</span> : null}
                    </td>
                    <td className="px-5 py-3 text-brown-500">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          expired ? "bg-beige text-brown-500" : c.is_active ? "bg-pista-50 text-pista-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onToggleActive(c)}
                          className={`p-2 rounded-lg ${c.is_active ? "hover:bg-red-50 text-red-600" : "hover:bg-pista-50 text-pista-700"}`}
                          aria-label={c.is_active ? "Deactivate" : "Activate"}
                          title={c.is_active ? "Deactivate" : "Activate"}
                        >
                          {c.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button onClick={() => onEdit(c)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(c)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
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
      {!loading && coupons.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No coupons found.</p>}
    </div>
  );
}
