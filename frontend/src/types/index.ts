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

export type AddressType = "home" | "office" | "other";

export interface Address {
  id: string;
  full_name: string;
  mobile_number: string;
  house_no: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: AddressType;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number | null;
  gst_percentage: number;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_seasonal: boolean;
  created_at: string;
  images: ProductImage[];
  category: Category;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Raw shapes returned by /cart and /wishlist — see backend/app/schemas/{cart,wishlist}.py */
export interface CartItemApi {
  id: string;
  product: Product;
  quantity: number;
  line_subtotal: number;
  line_discount: number;
  line_gst: number;
  line_total: number;
}

export interface CartApi {
  items: CartItemApi[];
  item_count: number;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
}

export interface WishlistItemApi {
  id: string;
  product: Product;
}

export interface WishlistApi {
  items: WishlistItemApi[];
  count: number;
}

export interface MoveToCartResponse {
  cart: CartApi;
  wishlist: WishlistApi;
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

export interface OrderItemApi {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
  line_gst: number;
  line_total: number;
}

export interface OrderStatusHistoryApi {
  status: OrderStatus;
  note?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  gst_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_code?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  refunded_at?: string | null;
  created_at: string;
  items: OrderItemApi[];
  address: Address;
  status_history: OrderStatusHistoryApi[];
}

export interface OrderListItem {
  id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  item_count: number;
  created_at: string;
}

export interface OrderListResponse {
  items: OrderListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminOrderListItem extends OrderListItem {
  customer_name: string;
  customer_email: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ReorderResponse {
  cart: CartApi;
  skipped: string[];
}

export type DiscountType = "percentage" | "flat";

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount?: number | null;
  max_uses?: number | null;
  per_user_limit?: number | null;
  is_active: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  used_count: number;
  created_at: string;
}

export interface CouponListResponse {
  items: Coupon[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CouponValidateResponse {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  message: string;
}

export interface CreateRazorpayOrderResponse {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
  subtotal: number;
  discount: number;
  gst: number;
  shipping: number;
  total: number;
}

export interface VerifyPaymentResponse {
  status: string;
  payment_id: string;
  razorpay_payment_id: string;
  amount: number;
  order_id: string;
  order_number: string;
}
