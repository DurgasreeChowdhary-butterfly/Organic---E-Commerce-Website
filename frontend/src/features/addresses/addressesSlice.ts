import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ADDRESSES } from "@/data/orders";
import type { Address } from "@/types";

const STORAGE_KEY = "prakruti_addresses";

export interface AddressesState {
  items: Address[];
}

function loadPersisted(): Address[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Address[]) : ADDRESSES;
  } catch {
    return ADDRESSES;
  }
}

function persist(items: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const initialState: AddressesState = {
  items: loadPersisted(),
};

const addressesSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    addAddress: {
      reducer(state, action: PayloadAction<Address>) {
        if (action.payload.is_default) {
          state.items.forEach((a) => (a.is_default = false));
        }
        state.items.push(action.payload);
        persist(state.items);
      },
      prepare(address: Omit<Address, "id">) {
        return { payload: { ...address, id: `addr_${Date.now()}` } };
      },
    },
    updateAddress(state, action: PayloadAction<Address>) {
      if (action.payload.is_default) {
        state.items.forEach((a) => (a.is_default = false));
      }
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      persist(state.items);
    },
    removeAddress(state, action: PayloadAction<string>) {
      state.items = state.items.filter((a) => a.id !== action.payload);
      persist(state.items);
    },
    setDefaultAddress(state, action: PayloadAction<string>) {
      state.items.forEach((a) => (a.is_default = a.id === action.payload));
      persist(state.items);
    },
  },
});

export const { addAddress, updateAddress, removeAddress, setDefaultAddress } = addressesSlice.actions;
export default addressesSlice.reducer;
