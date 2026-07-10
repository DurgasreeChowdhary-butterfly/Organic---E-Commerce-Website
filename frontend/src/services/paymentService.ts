// TODO: uncomment once wired to the real backend
// import { apiClient } from "./apiClient";

// TODO: implement Razorpay checkout flow:
// 1. POST /payments/razorpay/create-order
// 2. Open Razorpay Checkout.js widget
// 3. POST /payments/razorpay/verify with the returned signature

export async function createRazorpayOrder(_orderId: string) {
  throw new Error("Not implemented");
}
