import { apiClient } from "./apiClient";
import { toDummyProduct, type DummyProductListResponse } from "./productService";
import type { DummyProduct } from "@/data/products";
import type {
  AdminOrderListResponse,
  AffiliateAdmin,
  AffiliateListResponse,
  AffiliateStatus,
  AttributedOrderSummary,
  Branding,
  Category,
  Commission,
  CommissionListResponse,
  CommissionStatus,
  Coupon,
  CouponListResponse,
  CustomerDetail,
  CustomerListResponse,
  DashboardAnalytics,
  DiscountType,
  InventoryListResponse,
  InventoryItem,
  InventoryTransactionListResponse,
  Order,
  OrderStatus,
  Product,
  ProductListResponse,
} from "@/types";

export async function getDashboardStats(trendDays = 7): Promise<DashboardAnalytics> {
  const { data } = await apiClient.get<DashboardAnalytics>("/admin/dashboard/stats", { params: { trend_days: trendDays } });
  return data;
}

// ---------- Admin: Branding ----------

export async function adminUploadBrandingLogo(file: File): Promise<Branding> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<Branding>("/admin/branding/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function adminDeleteBrandingLogo(): Promise<Branding> {
  const { data } = await apiClient.delete<Branding>("/admin/branding/logo");
  return data;
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
  is_influencer?: boolean;
  influencer_name?: string | null;
  influencer_commission_percentage?: number | null;
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

// ---------- Admin: Inventory ----------

export interface AdminInventoryListParams {
  search?: string;
  category?: string;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  page?: number;
  page_size?: number;
}

export async function adminListInventory(params: AdminInventoryListParams = {}): Promise<InventoryListResponse> {
  const { data } = await apiClient.get<InventoryListResponse>("/admin/inventory", { params });
  return data;
}

export async function adminGetLowStock(): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<InventoryItem[]>("/admin/inventory/low-stock");
  return data;
}

export async function adminIncreaseStock(productId: string, quantity: number, reason: string): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>(`/admin/inventory/${productId}/increase`, { quantity, reason });
  return data;
}

export async function adminDecreaseStock(productId: string, quantity: number, reason: string): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>(`/admin/inventory/${productId}/decrease`, { quantity, reason });
  return data;
}

export async function adminCorrectStock(productId: string, newQuantity: number, reason: string): Promise<InventoryItem> {
  const { data } = await apiClient.post<InventoryItem>(`/admin/inventory/${productId}/correct`, { new_quantity: newQuantity, reason });
  return data;
}

export async function adminGetInventoryHistory(
  productId: string,
  params: { page?: number; page_size?: number } = {}
): Promise<InventoryTransactionListResponse> {
  const { data } = await apiClient.get<InventoryTransactionListResponse>(`/admin/inventory/${productId}/history`, { params });
  return data;
}

// ---------- Admin: Customers ----------

export interface AdminCustomerListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export async function adminListCustomers(params: AdminCustomerListParams = {}): Promise<CustomerListResponse> {
  const { data } = await apiClient.get<CustomerListResponse>("/admin/customers", { params });
  return data;
}

export async function adminGetCustomer(id: string): Promise<CustomerDetail> {
  const { data } = await apiClient.get<CustomerDetail>(`/admin/customers/${id}`);
  return data;
}

// ---------- Admin: Affiliates ----------

export interface AdminAffiliateListParams {
  search?: string;
  status?: AffiliateStatus;
  page?: number;
  page_size?: number;
}

export async function adminListAffiliates(params: AdminAffiliateListParams = {}): Promise<AffiliateListResponse> {
  const { data } = await apiClient.get<AffiliateListResponse>("/admin/affiliates", { params });
  return data;
}

export async function adminApproveAffiliate(id: string): Promise<AffiliateAdmin> {
  const { data } = await apiClient.post<AffiliateAdmin>(`/admin/affiliates/${id}/approve`);
  return data;
}

export async function adminRejectAffiliate(id: string): Promise<AffiliateAdmin> {
  const { data } = await apiClient.post<AffiliateAdmin>(`/admin/affiliates/${id}/reject`);
  return data;
}

export async function adminBlockAffiliate(id: string): Promise<AffiliateAdmin> {
  const { data } = await apiClient.post<AffiliateAdmin>(`/admin/affiliates/${id}/block`);
  return data;
}

export async function adminUpdateAffiliateCommission(id: string, commissionPercentage: number): Promise<AffiliateAdmin> {
  const { data } = await apiClient.put<AffiliateAdmin>(`/admin/affiliates/${id}/commission`, {
    commission_percentage: commissionPercentage,
  });
  return data;
}

export async function adminGetAffiliateOrders(id: string): Promise<AttributedOrderSummary[]> {
  const { data } = await apiClient.get<AttributedOrderSummary[]>(`/admin/affiliates/${id}/orders`);
  return data;
}

// ---------- Admin: Commissions ----------

export interface AdminCommissionListParams {
  affiliate_id?: string;
  status?: CommissionStatus;
  page?: number;
  page_size?: number;
}

export async function adminListCommissions(params: AdminCommissionListParams = {}): Promise<CommissionListResponse> {
  const { data } = await apiClient.get<CommissionListResponse>("/admin/commissions", { params });
  return data;
}

export async function adminMarkCommissionPaid(id: string): Promise<Commission> {
  const { data } = await apiClient.post<Commission>(`/admin/commissions/${id}/mark-paid`);
  return data;
}
