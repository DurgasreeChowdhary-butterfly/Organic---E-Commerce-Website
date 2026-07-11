import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { Category } from "@/types";
import type { AdminCategoryInput } from "@/services/adminService";

const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name"),
  description: z.string().optional(),
});
type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AdminCategoryInput) => Promise<boolean>;
  initial?: Category | null;
}

/** Shared Add/Edit category form used by AdminCategoriesPage. */
export default function CategoryFormModal({ open, onClose, onSubmit, initial }: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    values: initial ? { name: initial.name, description: initial.description ?? "" } : undefined,
    defaultValues: { name: "", description: "" },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function submit(values: CategoryValues) {
    const ok = await onSubmit(values);
    if (ok) {
      reset();
      onClose();
    } else {
      setError("name", { message: "A category with this name already exists" });
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={initial ? "Edit Category" : "Add New Category"} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input {...register("name")} placeholder="Category name" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <textarea {...register("description")} placeholder="Description (optional)" rows={3} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 resize-none" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" fullWidth variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>{initial ? "Save Changes" : "Add Category"}</Button>
        </div>
      </form>
    </Modal>
  );
}
