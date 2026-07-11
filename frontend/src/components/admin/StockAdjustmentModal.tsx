import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { InventoryItem } from "@/types";

export type StockAdjustmentMode = "increase" | "decrease" | "correct";

const schema = z.object({
  amount: z.coerce.number({ invalid_type_error: "Enter a valid number" }).int("Must be a whole number"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(255),
});

type FormValues = z.infer<typeof schema>;

interface StockAdjustmentModalProps {
  open: boolean;
  mode: StockAdjustmentMode | null;
  item: InventoryItem | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

const MODE_CONFIG: Record<StockAdjustmentMode, { title: string; amountLabel: string; amountMin: number; cta: string }> = {
  increase: { title: "Increase Stock", amountLabel: "Quantity to add", amountMin: 1, cta: "Increase Stock" },
  decrease: { title: "Decrease Stock", amountLabel: "Quantity to remove", amountMin: 1, cta: "Decrease Stock" },
  correct: { title: "Correct Stock", amountLabel: "New stock quantity", amountMin: 0, cta: "Save Correction" },
};

/** Shared modal for stock increase/decrease/correction, each requiring a reason (audit trail). */
export default function StockAdjustmentModal({ open, mode, item, submitting, onClose, onSubmit }: StockAdjustmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: mode === "correct" ? item?.stock_quantity ?? 0 : 0, reason: "" },
  });

  if (!mode || !item) return null;
  const config = MODE_CONFIG[mode];

  function handleClose() {
    reset({ amount: 0, reason: "" });
    onClose();
  }

  function submit(values: FormValues) {
    onSubmit(values);
  }

  return (
    <Modal open={open} onClose={handleClose} title={`${config.title} — ${item.name}`}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <p className="text-xs text-brown-500">
          Current stock: <span className="font-semibold text-forest-700">{item.stock_quantity}</span> (threshold: {item.low_stock_threshold})
        </p>
        <div>
          <input
            {...register("amount")}
            type="number"
            min={config.amountMin}
            placeholder={config.amountLabel}
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
          />
          {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <textarea
            {...register("reason")}
            placeholder="Reason for this adjustment (required)"
            rows={3}
            className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 resize-none"
          />
          {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting || submitting} variant={mode === "decrease" ? "danger" : "primary"}>
            {config.cta}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
