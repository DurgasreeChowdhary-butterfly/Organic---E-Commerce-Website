import { apiClient } from "./apiClient";
import type { Branding } from "@/types";

export async function getBranding(): Promise<Branding> {
  const { data } = await apiClient.get<Branding>("/branding/");
  return data;
}
