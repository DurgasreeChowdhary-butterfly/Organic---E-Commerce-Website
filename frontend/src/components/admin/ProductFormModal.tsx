import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { CATEGORIES, type DummyProduct } from "@/data/products";

const TINTS = ["#8FA84D", "#C9A227", "#E98A4E", "#7A5230"];

const productSchema = z
  .object({
    name: z.string().min(2, "Enter a product name"),
    categorySlug: z.string().min(1, "Select a category"),
    price: z.coerce.number({ invalid_type_error: "Enter a valid price" }).positive("Price must be greater than 0"),
    discount_price: z.string().optional(),
    stock_quantity: z.coerce.number({ invalid_type_error: "Enter a valid stock count" }).int().min(0, "Stock can't be negative"),
    weight: z.string().min(1, "Enter a weight/size, e.g. 500 g"),
    description: z.string().min(10, "Description should be at least 10 characters"),
  })
  .refine((v) => !v.discount_price || Number(v.discount_price) < v.price, {
    message: "Discount price must be less than the regular price",
    path: ["discount_price"],
  });

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: DummyProduct) => void;
  initial?: DummyProduct | null;
}

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Shared Add/Edit product form used by AdminProductsPage. */
export default function ProductFormModal({ open, onClose, onSubmit, initial }: ProductFormModalProps) {
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
          categorySlug: initial.categorySlug,
          price: initial.price,
          discount_price: initial.discount_price ? String(initial.discount_price) : "",
          stock_quantity: initial.stock_quantity,
          weight: initial.weight,
          description: initial.description,
        }
      : undefined,
    defaultValues: { name: "", categorySlug: CATEGORIES[0]?.slug ?? "", price: 0, discount_price: "", stock_quantity: 0, weight: "", description: "" },
  });

  function submit(values: ProductFormValues) {
    const discountPrice = values.discount_price ? Number(values.discount_price) : undefined;
    const product: DummyProduct = initial
      ? {
          ...initial,
          name: values.name,
          categorySlug: values.categorySlug,
          category: CATEGORIES.find((c) => c.slug === values.categorySlug),
          price: values.price,
          discount_price: discountPrice,
          stock_quantity: values.stock_quantity,
          weight: values.weight,
          description: values.description,
        }
      : {
          id: `p_${Date.now()}`,
          name: values.name,
          slug: slugify(values.name) || `product-${Date.now()}`,
          description: values.description,
          price: values.price,
          discount_price: discountPrice,
          stock_quantity: values.stock_quantity,
          is_best_seller: false,
          is_new_arrival: true,
          categorySlug: values.categorySlug,
          category: CATEGORIES.find((c) => c.slug === values.categorySlug),
          rating: 0,
          reviewCount: 0,
          tint: TINTS[Math.floor(Math.random() * TINTS.length)],
          weight: values.weight,
          isBestSeller: false,
          isNewArrival: true,
          isSeasonal: false,
          specifications: [],
        };
    onSubmit(product);
    reset();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Product" : "Add New Product"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3">
        <div>
          <input {...register("name")} placeholder="Product name" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <select {...register("categorySlug")} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 bg-white">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          {errors.categorySlug && <p className="text-xs text-red-600 mt-1">{errors.categorySlug.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input {...register("price")} placeholder="Price (₹)" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <input {...register("discount_price")} placeholder="Discount price (optional)" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.discount_price && <p className="text-xs text-red-600 mt-1">{errors.discount_price.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input {...register("stock_quantity")} placeholder="Stock quantity" type="number" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.stock_quantity && <p className="text-xs text-red-600 mt-1">{errors.stock_quantity.message}</p>}
          </div>
          <div>
            <input {...register("weight")} placeholder="Weight (e.g. 500 g)" className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500" />
            {errors.weight && <p className="text-xs text-red-600 mt-1">{errors.weight.message}</p>}
          </div>
        </div>
        <div>
          <textarea {...register("description")} placeholder="Description" rows={3} className="w-full rounded-xl border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 resize-none" />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>
        <div className="border-2 border-dashed border-beige rounded-xl p-6 text-center text-xs text-brown-500">
          Drag & drop product images here (UI only — image upload is not part of this demo)
        </div>
        <div className="flex gap-3 mt-6">
          <Button type="button" fullWidth variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" fullWidth loading={isSubmitting}>{initial ? "Save Changes" : "Save Product"}</Button>
        </div>
      </form>
    </Modal>
  );
}
