import { apiClient } from "./apiClient";
import type { Affiliate, AffiliateApplyPayload, AffiliateApplyResponse, AffiliateDashboard, AttributedOrderSummary } from "@/types";

/** Public "Become an Affiliate" entry point. Works whether the caller is
 * logged in (payload is ignored server-side, current account is used) or
 * anonymous (payload creates a new account and applies it in one step). */
export async function applyAffiliate(payload: AffiliateApplyPayload): Promise<AffiliateApplyResponse> {
  const { data } = await apiClient.post<AffiliateApplyResponse>("/affiliate/apply", payload);
  return data;
}

export async function getMyAffiliateProfile(): Promise<Affiliate> {
  const { data } = await apiClient.get<Affiliate>("/affiliate/me");
  return data;
}

export async function getAffiliateDashboard(): Promise<AffiliateDashboard> {
  const { data } = await apiClient.get<AffiliateDashboard>("/affiliate/dashboard");
  return data;
}

export async function getAffiliateOrders(): Promise<AttributedOrderSummary[]> {
  const { data } = await apiClient.get<AttributedOrderSummary[]>("/affiliate/orders");
  return data;
}

/** Fire-and-forget click ping — failures are intentionally swallowed since
 * this must never block or break page navigation for a visitor. */
export function trackAffiliateClick(code: string, landingPath: string): void {
  apiClient.post("/affiliate/track-click", null, { params: { code, landing_path: landingPath } }).catch(() => undefined);
}
