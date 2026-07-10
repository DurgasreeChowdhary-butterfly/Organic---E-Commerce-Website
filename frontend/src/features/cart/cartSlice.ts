import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DummyProduct } from "@/data/products";

const STORAGE_KEY = "prakruti_cart";

export interface CartItem {
  id: string;
  product: DummyProduct;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  couponCode: string | null;
}

function loadPersisted(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const initialState: CartState = {
  items: loadPersisted(),
  couponCode: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: DummyProduct; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        const cap = product.stock_quantity || 99;
        existing.quantity = Math.min(existing.quantity + quantity, cap);
      } else {
        state.items.push({ id: `ci_${product.id}`, product, quantity });
      }
      persist(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = Math.max(1, action.payload.quantity);
      persist(state.items);
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state.items);
    },
    applyCoupon(state, action: PayloadAction<string | null>) {
      state.couponCode = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.couponCode = null;
      persist(state.items);
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, applyCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
