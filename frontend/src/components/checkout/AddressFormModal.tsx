import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { Address } from "@/types";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required (e.g. Home, Office)"),
  line1: z.string().min(5, "Enter your full address line"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => void;
  initial?: Address | null;
}

/** Shared Add/Edit address form used by CheckoutPage and AddressBookPage. */
export default function AddressFormModal({ open, onClose, onSubmit, initial }: AddressFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? { label: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false },
    values: initial
      ? { label: initial.label, line1: initial.line1, line2: initial.line2 ?? "", city: initial.city, state: initial.state, pincode: initial.pincode, is_default: initial.is_default }
      : undefined,
  });

  function submit(values: AddressFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Address" : "Add New Address"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input
            {...register("label")}
            placeholder="Label (Home, Office...)"
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.label && <p className="text-xs text-red-600 mt-1">{errors.label.message}</p>}
        </div>
        <div>
          <input
            {...register("line1")}
            placeholder="Address line 1"
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.line1 && <p className="text-xs text-red-600 mt-1">{errors.line1.message}</p>}
        </div>
        <input
          {...register("line2")}
          placeholder="Address line 2 (optional)"
          className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("city")}
              placeholder="City"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <input
              {...register("state")}
              placeholder="State"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
          </div>
        </div>
        <div>
          <input
            {...register("pincode")}
            placeholder="Pincode"
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
          <input type="checkbox" {...register("is_default")} className="w-4 h-4 rounded accent-pista-700" />
          Set as default address
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>{initial ? "Save Changes" : "Add Address"}</Button>
        </div>
      </form>
    </Modal>
  );
}
