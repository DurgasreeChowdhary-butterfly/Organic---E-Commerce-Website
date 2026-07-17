import { apiClient } from "./apiClient";
import type { Affiliate, AffiliateDashboard, AttributedOrderSummary } from "@/types";

export async function registerAffiliate(): Promise<Affiliate> {
  const { data } = await apiClient.post<Affiliate>("/affiliate/register");
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
