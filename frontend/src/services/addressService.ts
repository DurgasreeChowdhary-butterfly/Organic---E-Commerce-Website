import { apiClient } from "./apiClient";
import type { Address } from "@/types";

export type AddressPayload = Omit<Address, "id">;
export type AddressUpdatePayload = Partial<AddressPayload>;

export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>("/addresses/");
  return data;
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await apiClient.post<Address>("/addresses/", payload);
  return data;
}

export async function updateAddress(id: string, payload: AddressUpdatePayload): Promise<Address> {
  const { data } = await apiClient.put<Address>(`/addresses/${id}`, payload);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const { data } = await apiClient.post<Address>(`/addresses/${id}/set-default`);
  return data;
}
