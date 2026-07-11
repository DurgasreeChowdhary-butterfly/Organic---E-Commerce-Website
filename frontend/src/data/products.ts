/**
 * Product/category data now comes from the real backend (see
 * src/services/productService.ts and src/features/products/productsSlice.ts).
 *
 * `DummyProduct` stays here as the shape the UI components render
 * (ProductCard, ProductGrid, CartItemRow, wishlist/cart slices, etc.) —
 * it extends the real `Product` type with a few presentation-only fields
 * (tint, rating, specifications) that aren't part of the backend schema.
 * `productService.ts` adapts each API `Product` into this shape so none
 * of those components needed to change.
 */
import type { Product } from "@/types";

export interface DummyProduct extends Omit<Product, "discount_price"> {
  discount_price?: number; // adapter always coerces the API's `number | null` down to this
  categorySlug: string;
  rating: number;
  reviewCount: number;
  tint: string; // brand accent used for placeholder art when no image exists
  weight: string; // repurposed to show the category name (no "weight" field in the real schema)
  isBestSeller: boolean;
  isNewArrival: boolean;
  isSeasonal: boolean;
  specifications: { label: string; value: string }[];
}
