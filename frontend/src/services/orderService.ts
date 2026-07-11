import { apiClient } from "./apiClient";
import type { Order, OrderListResponse, ReorderResponse } from "@/types";

export interface OrderListParams {
  page?: number;
  page_size?: number;
}

export async function getOrders(params: OrderListParams = {}): Promise<OrderListResponse> {
  const { data } = await apiClient.get<OrderListResponse>("/orders/", { params });
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
  return data;
}

export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/orders/${orderId}/cancel`, { reason });
  return data;
}

export async function reorder(orderId: string): Promise<ReorderResponse> {
  const { data } = await apiClient.post<ReorderResponse>(`/orders/${orderId}/reorder`);
  return data;
}

/** Fetches the invoice PDF and triggers a browser download. */
export async function downloadInvoice(orderId: string, orderNumber: string, endpoint = `/orders/${orderId}/invoice`): Promise<void> {
  const { data } = await apiClient.get(endpoint, { responseType: "blob" });
  const url = URL.createObjectURL(data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${orderNumber}-invoice.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
