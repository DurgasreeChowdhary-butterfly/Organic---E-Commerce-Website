/**
 * Shared TypeScript types mirroring backend Pydantic schemas.
 * Keep these in sync with backend/app/schemas/*.py as the API evolves.
 */

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  is_admin: boolean;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  images?: ProductImage[];
  category?: Category;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
}
