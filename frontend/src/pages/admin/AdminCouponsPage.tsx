import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import CouponTable from "@/components/admin/CouponTable";
import CouponFormModal from "@/components/admin/CouponFormModal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/common/Button";
import type { Coupon } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  adminCreateCouponThunk,
  adminDeleteCouponThunk,
  adminFetchCouponsThunk,
  adminToggleCouponActiveThunk,
  adminUpdateCouponThunk,
  clearAdminCouponError,
} from "@/features/coupon/couponSlice";
import type { AdminCouponInput } from "@/services/adminService";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminCouponsPage() {
  const dispatch = useAppDispatch();
  const { adminItems: coupons, adminTotal, adminPage, adminTotalPages, adminStatus, adminError } = useAppSelector((s) => s.coupon);
  const loading = adminStatus === "loading" || adminStatus === "idle";

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    dispatch(adminFetchCouponsThunk({ search: debouncedSearch || undefined, page, page_size: 10 }));
  }, [dispatch, debouncedSearch, page]);

  function openAdd() {
    setEditing(null);
    dispatch(clearAdminCouponError());
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    dispatch(clearAdminCouponError());
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  async function handleSubmit(payload: AdminCouponInput): Promise<boolean> {
    const result = editing
      ? await dispatch(adminUpdateCouponThunk({ id: editing.id, payload }))
      : await dispatch(adminCreateCouponThunk(payload));

    if (adminCreateCouponThunk.fulfilled.match(result) || adminUpdateCouponThunk.fulfilled.match(result)) {
      dispatch(adminFetchCouponsThunk({ search: debouncedSearch || undefined, page, page_size: 10 }));
      return true;
    }
    return false;
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditing(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(adminDeleteCouponThunk(deleteTarget.id));
    setDeleting(false);
    if (adminDeleteCouponThunk.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  }

  function handleToggleActive(coupon: Coupon) {
    dispatch(adminToggleCouponActiveThunk({ id: coupon.id, isActive: !coupon.is_active }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Coupons</h1>
          <p className="text-sm text-brown-500">Create and manage discount coupons.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Coupon</Button>
      </div>

      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-white shadow-soft w-full max-w-xs mb-5">
        <Search className="w-4 h-4 text-brown-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
          placeholder="Search coupon codes..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
        />
        {search && (
          <button onClick={() => setSearchParams({})} aria-label="Clear search">
            <X className="w-3.5 h-3.5 text-brown-500" />
          </button>
        )}
      </div>

      {adminError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {adminError}
        </div>
      )}

      <CouponTable coupons={coupons} onEdit={openEdit} onDelete={setDeleteTarget} onToggleActive={handleToggleActive} loading={loading} />

      {!loading && adminTotalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={adminPage <= 1}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-brown-500">Page {adminPage} of {adminTotalPages} · {adminTotal} coupons</span>
          <button
            onClick={() => setPage((p) => Math.min(adminTotalPages, p + 1))}
            disabled={adminPage >= adminTotalPages}
            className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <CouponFormModal
        key={modalKey}
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete coupon?"
        description={`"${deleteTarget?.code}" will be permanently removed.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
