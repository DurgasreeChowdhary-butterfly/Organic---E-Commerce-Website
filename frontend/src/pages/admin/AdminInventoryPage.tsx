import { useEffect, useState } from "react";
import { AlertTriangle, Leaf, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminFetchProductsThunk, adminUpdateProductThunk } from "@/features/products/productsSlice";
import { TableRowsSkeleton } from "@/components/common/Skeleton";

export default function AdminInventoryPage() {
  const dispatch = useAppDispatch();
  const { adminItems: products, adminStatus } = useAppSelector((s) => s.products);
  const loading = adminStatus === "loading" || adminStatus === "idle";
  const [stock, setStock] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(adminFetchProductsThunk({ page_size: 100 }));
  }, [dispatch]);

  useEffect(() => {
    setStock((prev) => {
      const next = { ...prev };
      for (const p of products) if (!(p.id in next)) next[p.id] = p.stock_quantity;
      return next;
    });
  }, [products]);

  function updateStock(id: string, value: number) {
    setStock((prev) => ({ ...prev, [id]: value }));
  }

  async function save(id: string) {
    setSavingId(id);
    const result = await dispatch(adminUpdateProductThunk({ id, payload: { stock_quantity: stock[id] } }));
    setSavingId(null);
    if (adminUpdateProductThunk.fulfilled.match(result)) {
      setSavedId(id);
      setTimeout(() => setSavedId(null), 1200);
    }
  }

  const stockValues = Object.values(stock);
  const totalUnits = stockValues.reduce((a, b) => a + b, 0);
  const outOfStockCount = stockValues.filter((v) => v === 0).length;
  const lowStockCount = stockValues.filter((v) => v > 0 && v < 10).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-forest-700">Inventory</h1>
        <p className="text-sm text-brown-500">Track and update stock levels across your catalog.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-3xl bg-white shadow-soft p-5">
          <p className="text-xs text-brown-500 mb-1">Total Units in Stock</p>
          <p className="font-display text-2xl text-forest-700">{totalUnits}</p>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-5">
          <p className="text-xs text-brown-500 mb-1">Low Stock Items</p>
          <p className="font-display text-2xl text-soft-orange">{lowStockCount}</p>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-5">
          <p className="text-xs text-brown-500 mb-1">Out of Stock Items</p>
          <p className="font-display text-2xl text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-beige text-left text-brown-500">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Current Stock</th>
                <th className="px-5 py-3 font-medium">Update</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            {!loading && (
              <tbody>
                {products.map((p) => {
                  const qty = stock[p.id] ?? p.stock_quantity;
                  return (
                    <tr key={p.id} className="border-b border-beige/60 last:border-0 hover:bg-pista-50/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.tint}22` }}>
                            <Leaf className="w-4 h-4" style={{ color: p.tint }} />
                          </div>
                          <span className="font-medium text-forest-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-brown-500">{p.stock_quantity}</td>
                      <td className="px-5 py-3">
                        <input
                          type="number" min={0} value={qty}
                          onChange={(e) => updateStock(p.id, Number(e.target.value))}
                          className="w-20 rounded-lg border border-beige px-2 py-1 text-sm outline-none focus:border-pista-500"
                        />
                      </td>
                      <td className="px-5 py-3">
                        {qty === 0 ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><AlertTriangle className="w-3.5 h-3.5" /> Out of stock</span>
                        ) : qty < 10 ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-soft-orange"><AlertTriangle className="w-3.5 h-3.5" /> Low stock</span>
                        ) : (
                          <span className="text-xs font-semibold text-pista-700">Healthy</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => save(p.id)}
                          disabled={savingId === p.id}
                          className="text-xs font-semibold text-forest-700 hover:text-pista-700 inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" /> {savingId === p.id ? "Saving…" : savedId === p.id ? "Saved!" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        {loading && <TableRowsSkeleton rows={5} cols={5} />}
        {!loading && products.length === 0 && <p className="text-center text-sm text-brown-500 py-10">No products in your catalog yet.</p>}
      </div>
    </div>
  );
}
