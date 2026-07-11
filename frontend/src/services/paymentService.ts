import { apiClient } from "./apiClient";
import type { CreateRazorpayOrderResponse, VerifyPaymentResponse } from "@/types";

export interface CreateRazorpayOrderPayload {
  address_id: string;
  coupon_code?: string;
}

export async function createRazorpayOrder(payload: CreateRazorpayOrderPayload): Promise<CreateRazorpayOrderResponse> {
  const { data } = await apiClient.post<CreateRazorpayOrderResponse>("/payments/razorpay/create-order", payload);
  return data;
}

export interface VerifyPaymentPayload {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function verifyRazorpayPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  const { data } = await apiClient.post<VerifyPaymentResponse>("/payments/razorpay/verify", payload);
  return data;
}

export async function reportPaymentFailure(paymentId: string, reason?: string): Promise<void> {
  await apiClient.post("/payments/razorpay/failure", { payment_id: paymentId, reason });
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<boolean> | null = null;

/** Lazily injects the Razorpay Checkout.js script; resolves false if it fails to load. */
export function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  scriptPromise ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

/**
 * Opens the Razorpay Checkout modal. Resolves with the payment response on
 * success, or rejects with `{ cancelled: true }` if the user dismisses the
 * modal without paying — callers distinguish cancellation from a hard error
 * by checking `error?.cancelled`.
 */
export async function openRazorpayCheckout(
  options: Omit<RazorpayCheckoutOptions, "handler" | "modal">
): Promise<RazorpaySuccessResponse> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Could not load the payment gateway. Please check your connection and try again.");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay!({
      ...options,
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject({ cancelled: true }) },
    });
    razorpay.open();
  });
}
