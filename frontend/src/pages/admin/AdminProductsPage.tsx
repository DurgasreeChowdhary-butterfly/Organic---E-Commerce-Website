import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import ProductTable from "@/components/admin/ProductTable";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/common/Button";
import { PRODUCTS, type DummyProduct } from "@/data/products";
import { useLoading } from "@/hooks/useLoading";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DummyProduct[]>(PRODUCTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DummyProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DummyProduct | null>(null);
  const loading = useLoading(300);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const filtered = useMemo(
    () => (search ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : products),
    [products, search]
  );

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: DummyProduct) {
    setEditing(product);
    setModalOpen(true);
  }

  function handleSubmit(product: DummyProduct) {
    setProducts((prev) => (editing ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev]));
    setModalOpen(false);
    setEditing(null);
  }

  function confirmDelete() {
    if (deleteTarget) setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Products</h1>
          <p className="text-sm text-brown-500">Manage your product catalog, pricing, and stock.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Product</Button>
      </div>

      {search && (
        <div className="flex items-center gap-2 mb-4 text-sm text-brown-500">
          <Search className="w-4 h-4" />
          Showing results for "<span className="text-forest-700 font-medium">{search}</span>"
          <button onClick={() => setSearchParams({})} className="flex items-center gap-1 text-pista-700 hover:underline ml-1">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      )}

      <ProductTable products={filtered} onEdit={openEdit} onDelete={setDeleteTarget} loading={loading} />

      <ProductFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        description={`"${deleteTarget?.name}" will be removed from your catalog.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
