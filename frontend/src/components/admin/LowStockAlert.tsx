import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import type { DummyProduct } from "@/data/products";

interface LowStockAlertProps {
  products: DummyProduct[];
  loading?: boolean;
}

/** Dashboard widget listing products below their low-stock threshold. */
export default function LowStockAlert({ products, loading }: LowStockAlertProps) {
  return (
    <div className="rounded-3xl bg-white shadow-soft p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4.5 h-4.5 text-soft-orange" />
        <h3 className="font-semibold text-forest-700">Low Stock Alerts</h3>
      </div>
      {loading ? (
        <p className="text-sm text-brown-500">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-brown-500">All products are well stocked.</p>
      ) : (
        <div className="space-y-3 flex-1">
          {products.map((p) => (
            <Link key={p.id} to="/admin/inventory" className="flex items-center justify-between text-sm hover:text-pista-700 transition-colors">
              <span className="text-forest-700 truncate pr-2">{p.name}</span>
              <span className={`font-semibold shrink-0 ${p.stock_quantity === 0 ? "text-red-600" : "text-soft-orange"}`}>
                {p.stock_quantity === 0 ? "Out of stock" : `${p.stock_quantity} left`}
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link to="/admin/inventory" className="text-xs font-semibold text-pista-700 hover:underline mt-4 inline-block">
        Manage inventory →
      </Link>
    </div>
  );
}
