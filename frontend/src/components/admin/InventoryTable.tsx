import { ArrowUpCircle, ArrowDownCircle, ClipboardEdit, History } from "lucide-react";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import type { InventoryItem } from "@/types";

const STATUS_LABEL: Record<InventoryItem["stock_status"], string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

const STATUS_CLASS: Record<InventoryItem["stock_status"], string> = {
  in_stock: "bg-pista-50 text-pista-700",
  low_stock: "bg-soft-orange/10 text-soft-orange",
  out_of_stock: "bg-red-50 text-red-600",
};

interface InventoryTableProps {
  items: InventoryItem[];
  onIncrease: (item: InventoryItem) => void;
  onDecrease: (item: InventoryItem) => void;
  onCorrect: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
  loading?: boolean;
}

/** Admin inventory table: stock levels, status, and stock-adjustment actions. */
export default function InventoryTable({ items, onIncrease, onDecrease, onCorrect, onHistory, loading }: InventoryTableProps) {
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Current Stock</th>
              <th className="px-5 py-3 font-medium">Low Stock At</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Last Updated</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                  <td className="px-5 py-3 font-medium text-forest-700">{item.name}</td>
                  <td className="px-5 py-3 text-brown-500">{item.sku}</td>
                  <td className="px-5 py-3 text-brown-500">{item.category_name}</td>
                  <td className={`px-5 py-3 font-medium ${item.stock_status === "out_of_stock" ? "text-red-600" : item.stock_status === "low_stock" ? "text-soft-orange" : "text-forest-700"}`}>
                    {item.stock_quantity}
                  </td>
                  <td className="px-5 py-3 text-brown-500">{item.low_stock_threshold}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[item.stock_status]}`}>
                      {STATUS_LABEL[item.stock_status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brown-500 text-xs">
                    {new Date(item.last_updated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onIncrease(item)} className="p-2 rounded-lg hover:bg-pista-50 text-pista-700" aria-label="Increase stock" title="Increase stock">
                        <ArrowUpCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDecrease(item)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Decrease stock" title="Decrease stock">
                        <ArrowDownCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => onCorrect(item)} className="p-2 rounded-lg hover:bg-soft-orange/10 text-soft-orange" aria-label="Correct stock" title="Correct stock">
                        <ClipboardEdit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onHistory(item)} className="p-2 rounded-lg hover:bg-beige/60 text-forest-700" aria-label="View history" title="View history">
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {loading && <TableRowsSkeleton rows={5} cols={8} />}
      {!loading && items.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No products match this filter.</p>}
    </div>
  );
}
