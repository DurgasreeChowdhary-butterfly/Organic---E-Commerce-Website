import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DummyProduct } from "@/data/products";

const STORAGE_KEY = "prakruti_wishlist";

export interface WishlistItem {
  id: string;
  product: DummyProduct;
}

export interface WishlistState {
  items: WishlistItem[];
}

function loadPersisted(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: WishlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const initialState: WishlistState = {
  items: loadPersisted(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<DummyProduct>) {
      const product = action.payload;
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        state.items = state.items.filter((i) => i.product.id !== product.id);
      } else {
        state.items.push({ id: `wi_${product.id}`, product });
      }
      persist(state.items);
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    clearWishlist(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
