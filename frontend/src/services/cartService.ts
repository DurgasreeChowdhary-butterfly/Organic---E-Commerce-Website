import { apiClient } from "./apiClient";
import type { CartApi } from "@/types";

export async function getCart(): Promise<CartApi> {
  const { data } = await apiClient.get<CartApi>("/cart/");
  return data;
}

export async function addToCart(productId: string, quantity = 1): Promise<CartApi> {
  const { data } = await apiClient.post<CartApi>("/cart/items", { product_id: productId, quantity });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartApi> {
  const { data } = await apiClient.put<CartApi>(`/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId: string): Promise<CartApi> {
  const { data } = await apiClient.delete<CartApi>(`/cart/items/${itemId}`);
  return data;
}

export async function clearCart(): Promise<CartApi> {
  const { data } = await apiClient.delete<CartApi>("/cart/");
  return data;
}
