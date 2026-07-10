import { useState } from "react";
import { Pencil, Trash2, Leaf } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { formatCurrency } from "@/utils/formatCurrency";

/** Admin product management table with edit/delete actions (dummy data, non-persistent). */
export default function ProductTable() {
  const [products, setProducts] = useState(PRODUCTS);

  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.tint}22` }}>
                      <Leaf className="w-4.5 h-4.5" style={{ color: p.tint }} />
                    </div>
                    <span className="font-medium text-forest-700">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-brown-500 capitalize">{p.categorySlug.replace("-", " ")}</td>
                <td className="px-5 py-3 text-forest-700 font-medium">{formatCurrency(p.discount_price ?? p.price)}</td>
                <td className={`px-5 py-3 font-medium ${p.stock_quantity === 0 ? "text-red-600" : p.stock_quantity < 10 ? "text-soft-orange" : "text-forest-700"}`}>
                  {p.stock_quantity}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.stock_quantity === 0 ? "bg-red-50 text-red-600" : "bg-pista-50 text-pista-700"}`}>
                    {p.stock_quantity === 0 ? "Out of Stock" : "Active"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-pista-50 text-forest-700" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No products left. (This is dummy in-memory state — refresh to reset.)</p>}
    </div>
  );
}
