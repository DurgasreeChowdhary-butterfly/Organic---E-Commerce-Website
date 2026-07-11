import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Skeleton from "@/components/common/Skeleton";
import AddressFormModal, { type AddressFormValues } from "@/components/checkout/AddressFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createAddressThunk,
  updateAddressThunk,
  deleteAddressThunk,
  setDefaultAddressThunk,
  clearAddressesError,
} from "@/features/addresses/addressesSlice";
import type { Address } from "@/types";

const ADDRESS_TYPE_LABEL: Record<Address["address_type"], string> = {
  home: "Home",
  office: "Office",
  other: "Other",
};

export default function AddressBookPage() {
  const { items: addresses, status, error, mutatingId } = useAppSelector((s) => s.addresses);
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const loading = status === "idle" || status === "loading";

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setModalOpen(true);
  }

  async function handleSubmit(values: AddressFormValues) {
    setSaving(true);
    const payload = { ...values, landmark: values.landmark?.trim() ? values.landmark.trim() : undefined };
    const result = editing
      ? await dispatch(updateAddressThunk({ id: editing.id, payload }))
      : await dispatch(createAddressThunk(payload));
    setSaving(false);
    if (createAddressThunk.fulfilled.match(result) || updateAddressThunk.fulfilled.match(result)) {
      setModalOpen(false);
      setEditing(null);
    }
  }

  function confirmDelete() {
    if (deleteTarget) dispatch(deleteAddressThunk(deleteTarget.id));
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8">
        <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-3xl bg-white shadow-soft p-3 sm:p-5 space-y-2 sm:space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Addresses" }]} />
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700">My Addresses</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd} className="!py-2 !px-4 !text-xs sm:!py-2.5 sm:!px-6 sm:!text-sm">Add Address</Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => dispatch(clearAddressesError())} className="text-xs font-semibold underline shrink-0">Dismiss</button>
        </div>
      )}

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add an address to make checkout faster next time." actionLabel="Add Address" onAction={openAdd} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
          {addresses.map((addr) => {
            const busy = mutatingId === addr.id;
            return (
              <div key={addr.id} className="rounded-3xl bg-white shadow-soft p-3 sm:p-5 animate-fade-up">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-sm font-semibold text-forest-700">{addr.full_name} · {ADDRESS_TYPE_LABEL[addr.address_type]}</span>
                  {addr.is_default && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full shrink-0">
                      <Star className="w-3 h-3 fill-gold" /> Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-brown-500 leading-relaxed mb-1">{addr.mobile_number}</p>
                <p className="text-xs text-brown-500 leading-relaxed mb-2.5 sm:mb-4">
                  {addr.house_no}, {addr.street}{addr.landmark && `, ${addr.landmark}`}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
                  <button onClick={() => openEdit(addr)} disabled={busy} className="flex items-center gap-1 text-forest-700 hover:text-pista-700 disabled:opacity-50 active:scale-95"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => setDeleteTarget(addr)} disabled={busy} className="flex items-center gap-1 text-brown-500 hover:text-red-600 disabled:opacity-50 active:scale-95"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  {!addr.is_default && (
                    <button onClick={() => dispatch(setDefaultAddressThunk(addr.id))} disabled={busy} className="text-pista-700 hover:underline ml-auto disabled:opacity-50">Set as default</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddressFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
        submitting={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete address?"
        description={`This will remove "${deleteTarget?.full_name}"'s address from your saved addresses.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
