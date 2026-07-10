import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AddressFormModal, { type AddressFormValues } from "@/components/checkout/AddressFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addAddress, updateAddress, removeAddress, setDefaultAddress } from "@/features/addresses/addressesSlice";
import type { Address } from "@/types";

export default function AddressBookPage() {
  const addresses = useAppSelector((s) => s.addresses.items);
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setModalOpen(true);
  }

  function handleSubmit(values: AddressFormValues) {
    if (editing) {
      dispatch(updateAddress({ ...editing, ...values }));
    } else {
      dispatch(addAddress(values));
    }
    setModalOpen(false);
    setEditing(null);
  }

  function confirmDelete() {
    if (deleteTarget) dispatch(removeAddress(deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "My Addresses" }]} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-forest-700">My Addresses</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Address</Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add an address to make checkout faster next time." actionLabel="Add Address" onAction={openAdd} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-3xl bg-white shadow-soft p-5 animate-fade-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-forest-700">{addr.label}</span>
                {addr.is_default && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-gold bg-gold/10 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-gold" /> Default
                  </span>
                )}
              </div>
              <p className="text-xs text-brown-500 leading-relaxed mb-4">
                {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-forest-700 hover:text-pista-700"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => setDeleteTarget(addr)} className="flex items-center gap-1 text-brown-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                {!addr.is_default && (
                  <button onClick={() => dispatch(setDefaultAddress(addr.id))} className="text-pista-700 hover:underline ml-auto">Set as default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete address?"
        description={`This will remove "${deleteTarget?.label}" from your saved addresses.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
