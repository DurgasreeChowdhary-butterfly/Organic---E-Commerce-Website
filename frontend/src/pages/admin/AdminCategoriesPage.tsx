import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, AlertCircle } from "lucide-react";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import CategoryFormModal from "@/components/admin/CategoryFormModal";
import EmptyState from "@/components/common/EmptyState";
import { TableRowsSkeleton } from "@/components/common/Skeleton";
import type { Category } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminCreateCategoryThunk,
  adminDeleteCategoryThunk,
  adminFetchCategoriesThunk,
  adminUpdateCategoryThunk,
  clearProductsError,
} from "@/features/products/productsSlice";
import type { AdminCategoryInput } from "@/services/adminService";

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const { adminCategories: categories, adminCategoriesStatus, adminCategoryError } = useAppSelector((s) => s.products);
  const loading = adminCategoriesStatus === "loading" || adminCategoriesStatus === "idle";

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(adminFetchCategoriesThunk());
  }, [dispatch]);

  function openAdd() {
    setEditing(null);
    dispatch(clearProductsError());
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    dispatch(clearProductsError());
    setModalOpen(true);
  }

  async function handleSubmit(values: AdminCategoryInput): Promise<boolean> {
    const result = editing
      ? await dispatch(adminUpdateCategoryThunk({ id: editing.id, payload: values }))
      : await dispatch(adminCreateCategoryThunk(values));

    const ok = adminCreateCategoryThunk.fulfilled.match(result) || adminUpdateCategoryThunk.fulfilled.match(result);
    if (ok) {
      dispatch(adminFetchCategoriesThunk());
      setEditing(null);
    }
    return ok;
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const result = await dispatch(adminDeleteCategoryThunk(deleteTarget.id));
    setDeleting(false);
    if (adminDeleteCategoryThunk.fulfilled.match(result)) {
      setDeleteTarget(null);
    } else {
      setDeleteError((result.payload as string) ?? "Could not delete this category.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Categories</h1>
          <p className="text-sm text-brown-500">Organize your storefront's product categories.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Category</Button>
      </div>

      {adminCategoryError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {adminCategoryError}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white shadow-soft"><TableRowsSkeleton rows={3} cols={1} /></div>
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Add your first category to organize products." actionLabel="Add Category" onAction={openAdd} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="rounded-3xl bg-white shadow-soft p-5 animate-fade-up">
              <div className="w-11 h-11 rounded-full bg-pista-50 flex items-center justify-center mb-3">
                <FolderTree className="w-5 h-5 text-pista-700" />
              </div>
              <h3 className="font-semibold text-forest-700 mb-1">{c.name}</h3>
              {c.description && <p className="text-xs text-brown-500 mb-2 line-clamp-2">{c.description}</p>}
              <p className="text-xs text-brown-500 mb-4">{c.product_count ?? 0} product{(c.product_count ?? 0) !== 1 ? "s" : ""}</p>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-forest-700 hover:text-pista-700"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => { setDeleteTarget(c); setDeleteError(null); }} className="flex items-center gap-1 text-brown-500 hover:text-red-600 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        description={deleteError ?? `"${deleteTarget?.name}" will be removed. Categories with products can't be deleted — reassign or remove those products first.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
