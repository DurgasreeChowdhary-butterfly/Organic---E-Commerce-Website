import { useState } from "react";
import { Plus, X } from "lucide-react";
import ProductTable from "@/components/admin/ProductTable";
import Button from "@/components/common/Button";

export default function AdminProductsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Products</h1>
          <p className="text-sm text-brown-500">Manage your product catalog, pricing, and stock.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>Add Product</Button>
      </div>

      <ProductTable />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-900/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-glass w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-forest-700">Add New Product</h2>
              <button onClick={() => setShowModal(false)} aria-label="Close"><X className="w-5 h-5 text-forest-700" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Product name" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Price (₹)" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
                <input placeholder="Stock quantity" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
              </div>
              <textarea placeholder="Description" rows={3} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 resize-none" />
              <div className="border-2 border-dashed border-beige rounded-xl p-6 text-center text-xs text-brown-500">
                Drag & drop product images here (UI only — upload not wired up yet)
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button fullWidth variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button fullWidth onClick={() => setShowModal(false)}>Save Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
