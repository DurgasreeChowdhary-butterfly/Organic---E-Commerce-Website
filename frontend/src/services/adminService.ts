import { apiClient } from "./apiClient";
import { toDummyProduct, type DummyProductListResponse } from "./productService";
import type { DummyProduct } from "@/data/products";
import type {
  AdminOrderListResponse,
  Category,
  Coupon,
  CouponListResponse,
  DiscountType,
  Order,
  OrderStatus,
  Product,
  ProductListResponse,
} from "@/types";

// TODO: implement once the Order/Dashboard modules are in scope.
export async function getDashboardStats() {
  throw new Error("Not implemented");
}

// ---------- Admin: Products ----------

export interface AdminProductInput {
  name: string;
  description: string;
  price: number;
  discount_price?: number | null;
  gst_percentage: number;
  sku: string;
  category_id: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface AdminProductListParams {
  search?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

export async function adminListProducts(params: AdminProductListParams = {}): Promise<DummyProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>("/admin/products", { params });
  return { ...data, items: data.items.map(toDummyProduct) };
}

export async function adminCreateProduct(payload: AdminProductInput): Promise<DummyProduct> {
  const { data } = await apiClient.post<Product>("/admin/products", payload);
  return toDummyProduct(data);
}

export async function adminUpdateProduct(id: string, payload: Partial<AdminProductInput>): Promise<DummyProduct> {
  const { data } = await apiClient.put<Product>(`/admin/products/${id}`, payload);
  return toDummyProduct(data);
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export interface UploadedImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export async function adminUploadProductImages(productId: string, files: File[]): Promise<UploadedImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const { data } = await apiClient.post<UploadedImage[]>(`/admin/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function adminDeleteProductImage(productId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
}

// ---------- Admin: Categories ----------

export interface AdminCategoryInput {
  name: string;
  description?: string;
  image_url?: string;
}

export async function adminListCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/admin/categories");
  return data;
}

export async function adminCreateCategory(payload: AdminCategoryInput): Promise<Category> {
  const { data } = await apiClient.post<Category>("/admin/categories", payload);
  return data;
}

export async function adminUpdateCategory(id: string, payload: Partial<AdminCategoryInput>): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/admin/categories/${id}`, payload);
  return data;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}

// ---------- Admin: Coupons ----------

export interface AdminCouponInput {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value?: number;
  max_discount?: number | null;
  max_uses?: number | null;
  per_user_limit?: number | null;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface AdminCouponListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export async function adminListCoupons(params: AdminCouponListParams = {}): Promise<CouponListResponse> {
  const { data } = await apiClient.get<CouponListResponse>("/admin/coupons", { params });
  return data;
}

export async function adminCreateCoupon(payload: AdminCouponInput): Promise<Coupon> {
  const { data } = await apiClient.post<Coupon>("/admin/coupons", payload);
  return data;
}

export async function adminUpdateCoupon(id: string, payload: Partial<AdminCouponInput>): Promise<Coupon> {
  const { data } = await apiClient.put<Coupon>(`/admin/coupons/${id}`, payload);
  return data;
}

export async function adminDeleteCoupon(id: string): Promise<void> {
  await apiClient.delete(`/admin/coupons/${id}`);
}

export async function adminActivateCoupon(id: string): Promise<Coupon> {
  const { data } = await apiClient.post<Coupon>(`/admin/coupons/${id}/activate`);
  return data;
}

export async function adminDeactivateCoupon(id: string): Promise<Coupon> {
  const { data } = await apiClient.post<Coupon>(`/admin/coupons/${id}/deactivate`);
  return data;
}

// ---------- Admin: Orders ----------

export interface AdminOrderListParams {
  search?: string;
  status?: OrderStatus;
  page?: number;
  page_size?: number;
}

export async function adminListOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
  const { data } = await apiClient.get<AdminOrderListResponse>("/admin/orders", { params });
  return data;
}

export async function adminUpdateOrderStatus(id: string, orderStatus: OrderStatus, note?: string): Promise<Order> {
  const { data } = await apiClient.put<Order>(`/admin/orders/${id}/status`, { status: orderStatus, note });
  return data;
}

export async function adminCancelOrder(id: string, reason?: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/admin/orders/${id}/cancel`, { reason });
  return data;
}

export async function adminRefundOrder(id: string, reason?: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/admin/orders/${id}/refund`, { reason });
  return data;
}
