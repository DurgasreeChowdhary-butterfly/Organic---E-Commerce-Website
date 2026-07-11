import { apiClient } from "./apiClient";
import type { CouponValidateResponse } from "@/types";

export async function validateCoupon(code: string): Promise<CouponValidateResponse> {
  const { data } = await apiClient.post<CouponValidateResponse>("/coupons/validate", { code });
  return data;
}
