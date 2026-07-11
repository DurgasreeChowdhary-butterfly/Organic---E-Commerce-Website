import { apiClient } from "./apiClient";
import type { MoveToCartResponse, WishlistApi } from "@/types";

export async function getWishlist(): Promise<WishlistApi> {
  const { data } = await apiClient.get<WishlistApi>("/wishlist/");
  return data;
}

export async function addToWishlist(productId: string): Promise<WishlistApi> {
  const { data } = await apiClient.post<WishlistApi>(`/wishlist/items/${productId}`);
  return data;
}

export async function removeFromWishlist(productId: string): Promise<WishlistApi> {
  const { data } = await apiClient.delete<WishlistApi>(`/wishlist/items/${productId}`);
  return data;
}

export async function moveToCart(productId: string): Promise<MoveToCartResponse> {
  const { data } = await apiClient.post<MoveToCartResponse>(`/wishlist/items/${productId}/move-to-cart`);
  return data;
}
