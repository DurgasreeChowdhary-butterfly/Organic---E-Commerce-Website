import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { Coupon } from "@/types";
import type { AdminCouponInput } from "@/services/adminService";

const couponSchema = z
  .object({
    code: z.string().min(3, "Code must be at least 3 characters").max(50, "Code is too long"),
    discount_type: z.enum(["percentage", "flat"]),
    discount_value: z.coerce.number({ invalid_type_error: "Enter a valid amount" }).positive("Must be greater than 0"),
    min_order_value: z.coerce.number({ invalid_type_error: "Enter a valid amount" }).min(0, "Can't be negative"),
    max_discount: z.string().optional(),
    max_uses: z.string().optional(),
    per_user_limit: z.string().optional(),
    valid_from: z.string().optional(),
    valid_until: z.string().optional(),
    is_active: z.boolean(),
    is_influencer: z.boolean(),
    influencer_name: z.string().optional(),
    influencer_commission_percentage: z.string().optional(),
  })
  .refine((v) => v.discount_type !== "percentage" || v.discount_value <= 100, {
    message: "Percentage discount cannot exceed 100",
    path: ["discount_value"],
  })
  .refine((v) => !v.valid_from || !v.valid_until || v.valid_from < v.valid_until, {
    message: "Start date must be before end date",
    path: ["valid_until"],
  })
  .refine((v) => !v.is_influencer || !!v.influencer_name?.trim(), {
    message: "Influencer name is required for influencer coupons",
    path: ["influencer_name"],
  })
  .refine(
    (v) => !v.is_influencer || (!!v.influencer_commission_percentage && Number(v.influencer_commission_percentage) > 0),
    { message: "Influencer commission % is required for influencer coupons", path: ["influencer_commission_percentage"] }
  );

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminCouponInput) => Promise<boolean>;
  initial?: Coupon | null;
}

function toDateInput(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

const DEFAULT_VALUES: CouponFormValues = {
  code: "",
  discount_type: "flat",
  discount_value: 0,
  min_order_value: 0,
  max_discount: "",
  max_uses: "",
  per_user_limit: "",
  valid_from: "",
  valid_until: "",
  is_active: true,
  is_influencer: false,
  influencer_name: "",
  influencer_commission_percentage: "",
};

/** Shared Add/Edit coupon form used by AdminCouponsPage. */
export default function CouponFormModal({ open, onClose, onSubmit, initial }: CouponFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: DEFAULT_VALUES,
    values: initial
      ? {
          code: initial.code,
          discount_type: initial.discount_type,
          discount_value: initial.discount_value,
          min_order_value: initial.min_order_value,
          max_discount: initial.max_discount != null ? String(initial.max_discount) : "",
          max_uses: initial.max_uses != null ? String(initial.max_uses) : "",
          per_user_limit: initial.per_user_limit != null ? String(initial.per_user_limit) : "",
          valid_from: toDateInput(initial.valid_from),
          valid_until: toDateInput(initial.valid_until),
          is_active: initial.is_active,
          is_influencer: initial.is_influencer,
          influencer_name: initial.influencer_name ?? "",
          influencer_commission_percentage:
            initial.influencer_commission_percentage != null ? String(initial.influencer_commission_percentage) : "",
        }
      : undefined,
  });

  const discountType = watch("discount_type");
  const isInfluencer = watch("is_influencer");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset(DEFAULT_VALUES);
      setFormError(null);
      onClose();
    }
  }

  async function submit(values: CouponFormValues) {
    setFormError(null);
    const payload: AdminCouponInput = {
      code: values.code.trim().toUpperCase(),
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      min_order_value: values.min_order_value,
      max_discount: values.max_discount ? Number(values.max_discount) : null,
      max_uses: values.max_uses ? Number(values.max_uses) : null,
      per_user_limit: values.per_user_limit ? Number(values.per_user_limit) : null,
      valid_from: values.valid_from ? new Date(values.valid_from).toISOString() : null,
      valid_until: values.valid_until ? new Date(values.valid_until).toISOString() : null,
      is_active: values.is_active,
      is_influencer: values.is_influencer,
      influencer_name: values.is_influencer ? values.influencer_name?.trim() || null : null,
      influencer_commission_percentage: values.is_influencer && values.influencer_commission_percentage
        ? Number(values.influencer_commission_percentage)
        : null,
    };

    const saved = await onSubmit(payload);
    if (!saved) {
      setFormError("Could not save this coupon. Please check the form and try again.");
      return;
    }
    handleOpenChange(false);
  }

  return (
    <Modal open={open} onClose={() => handleOpenChange(false)} title={initial ? "Edit Coupon" : "Add New Coupon"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input
            {...register("code")}
            placeholder="Coupon code (e.g. WELCOME50)"
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 uppercase placeholder:normal-case"
          />
          {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <select {...register("discount_type")} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 bg-white">
              <option value="flat">Flat Amount (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
          <div>
            <input
              {...register("discount_value")}
              placeholder={discountType === "percentage" ? "Discount %" : "Discount ₹"}
              type="number"
              step="0.01"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.discount_value && <p className="text-xs text-red-600 mt-1">{errors.discount_value.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("min_order_value")}
              placeholder="Minimum order value (₹)"
              type="number"
              step="0.01"
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
            {errors.min_order_value && <p className="text-xs text-red-600 mt-1">{errors.min_order_value.message}</p>}
          </div>
          {discountType === "percentage" && (
            <div>
              <input
                {...register("max_discount")}
                placeholder="Max discount cap (₹, optional)"
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register("max_uses")}
              placeholder="Total usage limit (optional)"
              type="number"
              min={1}
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
          </div>
          <div>
            <input
              {...register("per_user_limit")}
              placeholder="Per-user limit (optional)"
              type="number"
              min={1}
              className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-brown-500 mb-1 block">Valid from (optional)</label>
            <input {...register("valid_from")} type="date" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-brown-500 mb-1 block">Valid until (optional)</label>
            <input {...register("valid_until")} type="date" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.valid_until && <p className="text-xs text-red-600 mt-1">{errors.valid_until.message}</p>}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
          <input type="checkbox" {...register("is_active")} className="w-4 h-4 rounded accent-pista-700" />
          Active
        </label>

        <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
          <input type="checkbox" {...register("is_influencer")} className="w-4 h-4 rounded accent-pista-700" />
          Influencer coupon
        </label>

        {isInfluencer && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-pista-50/40 p-3">
            <div>
              <input
                {...register("influencer_name")}
                placeholder="Influencer name"
                className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
              />
              {errors.influencer_name && <p className="text-xs text-red-600 mt-1">{errors.influencer_name.message}</p>}
            </div>
            <div>
              <input
                {...register("influencer_commission_percentage")}
                placeholder="Influencer commission %"
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
              />
              {errors.influencer_commission_percentage && (
                <p className="text-xs text-red-600 mt-1">{errors.influencer_commission_percentage.message}</p>
              )}
            </div>
            <p className="col-span-2 text-[11px] text-brown-500">
              Discount % above is what the customer gets. This commission % is paid to the influencer separately, on
              successful payment.
            </p>
          </div>
        )}

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>{initial ? "Save Changes" : "Create Coupon"}</Button>
        </div>
      </form>
    </Modal>
  );
}
