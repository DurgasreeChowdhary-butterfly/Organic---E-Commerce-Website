import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import type { DummyProduct } from "@/data/products";
import { useAppSelector } from "@/store/hooks";
import * as adminService from "@/services/adminService";
import type { AdminProductInput, UploadedImage } from "@/services/adminService";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

const productSchema = z
  .object({
    name: z.string().min(2, "Enter a product name"),
    sku: z.string().min(1, "Enter a SKU"),
    category_id: z.string().min(1, "Select a category"),
    price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).positive("Price must be greater than 0"),
    discount_price: z.string().optional(),
    gst_percentage: z.coerce.number({ invalid_type_error: "Enter a valid GST %" }).min(0).max(100),
    stock_quantity: z.coerce.number({ invalid_type_error: "Enter a valid stock count" }).int().min(0, "Stock can't be negative"),
    description: z.string().min(10, "Description should be at least 10 characters"),
    is_active: z.boolean(),
    is_featured: z.boolean(),
  })
  .refine((v) => !v.discount_price || Number(v.discount_price) < v.price, {
    message: "Discount price must be less than the regular price",
    path: ["discount_price"],
  });

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminProductInput) => Promise<DummyProduct | null>;
  initial?: DummyProduct | null;
}

/** Shared Add/Edit product form (+ image upload) used by AdminProductsPage. */
export default function ProductFormModal({ open, onClose, onSubmit, initial }: ProductFormModalProps) {
  const categories = useAppSelector((s) => s.products.categories);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    values: initial
      ? {
          name: initial.name,
          sku: initial.sku,
          category_id: initial.category.id,
          price: initial.price,
          discount_price: initial.discount_price ? String(initial.discount_price) : "",
          gst_percentage: initial.gst_percentage,
          stock_quantity: initial.stock_quantity,
          description: initial.description,
          is_active: initial.is_active,
          is_featured: initial.is_featured,
        }
      : undefined,
    defaultValues: {
      name: "", sku: "", category_id: categories[0]?.id ?? "", price: 0, discount_price: "",
      gst_percentage: 5, stock_quantity: 0, description: "", is_active: true, is_featured: false,
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setPendingFiles([]);
      setExistingImages(initial?.images ?? []);
      setFormError(null);
      onClose();
    }
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    // Snapshot the FileList synchronously — resetting e.target.value below
    // (to allow re-picking the same file later) also clears e.target.files,
    // and that clearing happens before React invokes a functional state
    // updater that lazily re-reads e.target.files, so the updater must
    // close over an already-captured array instead.
    const files = e.target.files ? Array.from(e.target.files) : [];
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  async function handleDeleteExistingImage(imageId: string) {
    if (!initial) return;
    try {
      await adminService.adminDeleteProductImage(initial.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setFormError("Could not remove that image. Please try again.");
    }
  }

  async function submit(values: ProductFormValues) {
    setFormError(null);
    const payload: AdminProductInput = {
      name: values.name,
      sku: values.sku,
      category_id: values.category_id,
      price: values.price,
      discount_price: values.discount_price ? Number(values.discount_price) : null,
      gst_percentage: values.gst_percentage,
      stock_quantity: values.stock_quantity,
      description: values.description,
      is_active: values.is_active,
      is_featured: values.is_featured,
    };

    const saved = await onSubmit(payload);
    if (!saved) {
      setFormError("Could not save this product. Please check the form and try again.");
      return;
    }

    if (pendingFiles.length > 0) {
      setUploading(true);
      try {
        await adminService.adminUploadProductImages(saved.id, pendingFiles);
      } catch {
        setFormError("Product saved, but image upload failed. You can retry from Edit.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    handleOpenChange(false);
  }

  const busy = isSubmitting || uploading;

  return (
    <Modal open={open} onClose={() => handleOpenChange(false)} title={initial ? "Edit Product" : "Add New Product"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input {...register("name")} placeholder="Product name" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input {...register("sku")} placeholder="SKU" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku.message}</p>}
          </div>
          <div>
            <select {...register("category_id")} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 bg-white">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <input {...register("price")} placeholder="Price (₹)" type="number" step="0.01" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <input {...register("discount_price")} placeholder="Discount (optional)" type="number" step="0.01" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.discount_price && <p className="text-xs text-red-600 mt-1">{errors.discount_price.message}</p>}
          </div>
          <div>
            <input {...register("gst_percentage")} placeholder="GST %" type="number" step="0.01" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.gst_percentage && <p className="text-xs text-red-600 mt-1">{errors.gst_percentage.message}</p>}
          </div>
        </div>
        <div>
          <input {...register("stock_quantity")} placeholder="Stock quantity" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          {errors.stock_quantity && <p className="text-xs text-red-600 mt-1">{errors.stock_quantity.message}</p>}
        </div>
        <div>
          <textarea {...register("description")} placeholder="Description" rows={3} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 resize-none" />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="w-4 h-4 rounded accent-pista-700" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-forest-700 cursor-pointer">
            <input type="checkbox" {...register("is_featured")} className="w-4 h-4 rounded accent-pista-700" />
            Featured
          </label>
        </div>

        {/* Images */}
        <div>
          <label className="text-xs font-semibold text-forest-700 mb-1.5 block">Images</label>
          {(existingImages.length > 0 || pendingFiles.length > 0) && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-beige group">
                  <img src={resolveImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && <Star className="absolute top-1 left-1 w-3.5 h-3.5 fill-gold text-gold" />}
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    className="absolute inset-0 bg-forest-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              {pendingFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-dashed border-pista-500 group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-forest-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    aria-label="Remove pending image"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="border-2 border-dashed border-beige rounded-xl p-4 text-center text-xs text-brown-500 flex flex-col items-center gap-1.5 cursor-pointer hover:border-pista-500 transition-colors">
            <ImagePlus className="w-5 h-5 text-brown-500" />
            Click to add images (JPEG/PNG/WebP, up to 5MB each)
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesSelected} />
          </label>
        </div>

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <div className="flex gap-3 mt-6">
          <Button type="button" fullWidth variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button type="submit" fullWidth loading={busy} icon={uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}>
            {uploading ? "Uploading images…" : initial ? "Save Changes" : "Save Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
