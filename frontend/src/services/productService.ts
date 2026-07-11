import { apiClient } from "./apiClient";
import type { DummyProduct } from "@/data/products";
import type { Category, Product, ProductListResponse } from "@/types";

const TINTS = ["#8FA84D", "#C9A227", "#E98A4E", "#7A5230"];

function hashTint(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

/**
 * Adapts a real API `Product` into the `DummyProduct` shape the existing
 * UI components (ProductCard, ProductGrid, CartItemRow, wishlist/cart
 * slices...) already render, so none of them needed to change. Fields
 * with no backend equivalent (rating/reviewCount — no review system yet;
 * tint — placeholder art when a product has no uploaded image) get
 * honest defaults instead of invented data.
 */
export function toDummyProduct(p: Product): DummyProduct {
  return {
    ...p,
    discount_price: p.discount_price ?? undefined,
    categorySlug: p.category.slug,
    rating: 0,
    reviewCount: 0,
    tint: hashTint(p.id),
    weight: p.category.name,
    isBestSeller: p.is_best_seller,
    isNewArrival: p.is_new_arrival,
    isSeasonal: p.is_seasonal,
    specifications: [],
  };
}

export interface ProductListParams {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  sort?: "newest" | "price_low" | "price_high" | "name_asc" | "popular";
  page?: number;
  page_size?: number;
}

export interface DummyProductListResponse {
  items: DummyProduct[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

function adaptList(data: ProductListResponse): DummyProductListResponse {
  return { ...data, items: data.items.map(toDummyProduct) };
}

export async function getProducts(params: ProductListParams = {}): Promise<DummyProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>("/products/", { params });
  return adaptList(data);
}

export async function searchProducts(q: string, page = 1, page_size = 20): Promise<DummyProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>("/products/search", { params: { q, page, page_size } });
  return adaptList(data);
}

export async function getFeaturedProducts(limit = 8): Promise<DummyProduct[]> {
  const { data } = await apiClient.get<Product[]>("/products/featured", { params: { limit } });
  return data.map(toDummyProduct);
}

export async function getLatestProducts(limit = 8): Promise<DummyProduct[]> {
  const { data } = await apiClient.get<Product[]>("/products/latest", { params: { limit } });
  return data.map(toDummyProduct);
}

export async function getProductBySlug(slug: string): Promise<DummyProduct> {
  const { data } = await apiClient.get<Product>(`/products/${slug}`);
  return toDummyProduct(data);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<DummyProduct[]> {
  const { data } = await apiClient.get<Product[]>(`/products/${slug}/related`, { params: { limit } });
  return data.map(toDummyProduct);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories/");
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${slug}`);
  return data;
}
