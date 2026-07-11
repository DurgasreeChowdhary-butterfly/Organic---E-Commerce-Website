import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { Address } from "@/types";

const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  house_no: z.string().min(1, "House/Flat No. is required"),
  street: z.string().min(2, "Street is required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  address_type: z.enum(["home", "office", "other"]),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => void;
  initial?: Address | null;
  submitting?: boolean;
}

const DEFAULT_VALUES: AddressFormValues = {
  full_name: "",
  mobile_number: "",
  house_no: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  address_type: "home",
  is_default: false,
};

/** Shared Add/Edit address form used by CheckoutPage and AddressBookPage. */
export default function AddressFormModal({ open, onClose, onSubmit, initial, submitting }: AddressFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: DEFAULT_VALUES,
    values: initial
      ? {
          full_name: initial.full_name,
          mobile_number: initial.mobile_number,
          house_no: initial.house_no,
          street: initial.street,
          landmark: initial.landmark ?? "",
          city: initial.city,
          state: initial.state,
          pincode: initial.pincode,
          address_type: initial.address_type,
          is_default: initial.is_default,
        }
      : undefined,
  });

  function submit(values: AddressFormValues) {
    onSubmit(values);
    reset(DEFAULT_VALUES);
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Address" : "Add New Address"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input
            {...register("full_name")}
            placeholder="Full name"
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <input
            {...register("mobile_number")}
            placeholder="Mobile number"
            inputMode="numeric"
            maxLength={10}
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.mobile_number && <p className="text-xs text-red-600 mt-1">{errors.mobile_number.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("house_no")}
              placeholder="House / Flat No."
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.house_no && <p className="text-xs text-red-600 mt-1">{errors.house_no.message}</p>}
          </div>
          <div>
            <input
              {...register("street")}
              placeholder="Street"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.street && <p className="text-xs text-red-600 mt-1">{errors.street.message}</p>}
          </div>
        </div>
        <input
          {...register("landmark")}
          placeholder="Landmark (optional)"
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("pincode")}
              placeholder="Pincode"
              inputMode="numeric"
              maxLength={6}
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode.message}</p>}
          </div>
          <div>
            <select
              {...register("address_type")}
              className="w-full h-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 bg-white"
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
          <input type="checkbox" {...register("is_default")} className="w-4 h-4 rounded accent-pista-700" />
          Set as default address
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting || submitting}>{initial ? "Save Changes" : "Add Address"}</Button>
        </div>
      </form>
    </Modal>
  );
}
