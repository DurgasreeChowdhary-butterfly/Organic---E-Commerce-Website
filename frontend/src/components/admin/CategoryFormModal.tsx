import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { ADMIN_CATEGORIES } from "@/data/admin";

const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name"),
});
type CategoryValues = z.infer<typeof categorySchema>;

export type AdminCategory = (typeof ADMIN_CATEGORIES)[number];

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryValues) => void;
  initial?: AdminCategory | null;
}

/** Shared Add/Edit category form used by AdminCategoriesPage. */
export default function CategoryFormModal({ open, onClose, onSubmit, initial }: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    values: initial ? { name: initial.name } : undefined,
    defaultValues: { name: "" },
  });

  function submit(values: CategoryValues) {
    onSubmit(values);
    reset();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Category" : "Add New Category"} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input {...register("name")} placeholder="Category name" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>{initial ? "Save Changes" : "Add Category"}</Button>
        </div>
      </form>
    </Modal>
  );
}
