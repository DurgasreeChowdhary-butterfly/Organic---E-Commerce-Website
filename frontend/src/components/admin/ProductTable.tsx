import { useState } from "react";
import { Pencil, Trash2, Leaf, Star } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DummyProduct } from "@/data/products";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

interface ProductTableProps {
  products: DummyProduct[];
  onEdit: (product: DummyProduct) => void;
  onDelete: (product: DummyProduct) => void;
  loading?: boolean;
}

/** Admin product management table with edit/delete actions. */
export default function ProductTable({ products, onEdit, onDelete, loading }: ProductTableProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-beige text-left text-brown-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          {!loading && (
            <tbody>
              {products.map((p) => {
                const primaryImage = p.images?.find((img) => img.is_primary) ?? p.images?.[0];
                const imageUrl = resolveImageUrl(primaryImage?.image_url);
                return (
                  <tr key={p.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `${p.tint}22` }}>
                          {imageUrl && !failedImages.has(p.id) ? (
                            <img
                              src={imageUrl}
                              alt=""
                              onError={() => setFailedImages((prev) => new Set(prev).add(p.id))}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Leaf className="w-4.5 h-4.5" style={{ color: p.tint }} />
                          )}
                        </div>
                        <span className="font-medium text-forest-700 flex items-center gap-1.5">
                          {p.name}
                          {p.is_featured && <Star className="w-3.5 h-3.5 fill-gold text-gold" aria-label="Featured" />}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brown-500">{p.sku}</td>
                    <td className="px-5 py-3 text-brown-500">{p.category.name}</td>
                    <td className="px-5 py-3 text-forest-700 font-medium">{formatCurrency(p.discount_price ?? p.price)}</td>
                    <td className={`px-5 py-3 font-medium ${p.stock_quantity === 0 ? "text-red-600" : p.stock_quantity < 10 ? "text-soft-orange" : "text-forest-700"}`}>
                      {p.stock_quantity}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${!p.is_active ? "bg-beige text-brown-500" : p.stock_quantity === 0 ? "bg-red-50 text-red-600" : "bg-pista-50 text-pista-700"}`}>
                        {!p.is_active ? "Inactive" : p.stock_quantity === 0 ? "Out of Stock" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-pista-50 text-forest-700" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
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
      {!loading && products.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No products found.</p>}
    </div>
  );
}
