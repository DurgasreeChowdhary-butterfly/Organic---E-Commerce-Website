import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as cartService from "@/services/cartService";
import { toDummyProduct } from "@/services/productService";
import type { DummyProduct } from "@/data/products";
import type { CartApi } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export interface CartItem {
  id: string;
  product: DummyProduct;
  quantity: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineGst: number;
  lineTotal: number;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  status: AsyncStatus;
  error: string | null;
  /** Item id currently being updated/removed — drives per-row loading state. */
  mutatingId: string | null;
  /** Snapshot for rolling back an optimistic update if the backend rejects it. */
  _snapshot: Pick<CartState, "items" | "itemCount" | "subtotal" | "discount" | "gst" | "total"> | null;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  gst: 0,
  total: 0,
  status: "idle",
  error: null,
  mutatingId: null,
  _snapshot: null,
};

function adaptCart(data: CartApi) {
  return {
    items: data.items.map((i) => ({
      id: i.id,
      product: toDummyProduct(i.product),
      quantity: i.quantity,
      lineSubtotal: i.line_subtotal,
      lineDiscount: i.line_discount,
      lineGst: i.line_gst,
      lineTotal: i.line_total,
    })),
    itemCount: data.item_count,
    subtotal: data.subtotal,
    discount: data.discount,
    gst: data.gst,
    total: data.total,
  };
}

function snapshotOf(state: CartState) {
  // Shallow-copy each item so later in-place mutations to the Immer draft
  // (e.g. bumping item.quantity for the optimistic update) don't also
  // silently mutate this snapshot — they'd otherwise alias the same draft
  // objects, making rollback on rejection a no-op.
  return {
    items: state.items.map((i) => ({ ...i })),
    itemCount: state.itemCount,
    subtotal: state.subtotal,
    discount: state.discount,
    gst: state.gst,
    total: state.total,
  };
}

export const fetchCartThunk = createAsyncThunk("cart/fetch", async (_: void, { rejectWithValue }) => {
  try {
    return await cartService.getCart();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not load your cart"));
  }
});

export const addToCartThunk = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(productId, quantity);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not add this item to your cart"));
    }
  }
);

export const updateCartItemThunk = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItem(itemId, quantity);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update quantity"));
    }
  }
);

export const removeCartItemThunk = createAsyncThunk(
  "cart/removeItem",
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await cartService.removeCartItem(itemId);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not remove this item"));
    }
  }
);

export const clearCartThunk = createAsyncThunk("cart/clear", async (_: void, { rejectWithValue }) => {
  try {
    return await cartService.clearCart();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not clear your cart"));
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError(state) {
      state.error = null;
    },
    resetCart(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, adaptCart(action.payload));
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load your cart";
      })

      .addCase(addToCartThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptCart(action.payload));
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Could not add this item to your cart";
      })

      // Optimistic quantity update: apply instantly, roll back on failure.
      .addCase(updateCartItemThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg.itemId;
        state._snapshot = snapshotOf(state);
        const item = state.items.find((i) => i.id === action.meta.arg.itemId);
        if (item) item.quantity = action.meta.arg.quantity;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptCart(action.payload));
        state.mutatingId = null;
        state._snapshot = null;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        if (state._snapshot) Object.assign(state, state._snapshot);
        state.mutatingId = null;
        state._snapshot = null;
        state.error = (action.payload as string) ?? "Could not update quantity";
      })

      // Optimistic remove: drop instantly, roll back on failure.
      .addCase(removeCartItemThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg;
        state._snapshot = snapshotOf(state);
        state.items = state.items.filter((i) => i.id !== action.meta.arg);
      })
      .addCase(removeCartItemThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptCart(action.payload));
        state.mutatingId = null;
        state._snapshot = null;
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        if (state._snapshot) Object.assign(state, state._snapshot);
        state.mutatingId = null;
        state._snapshot = null;
        state.error = (action.payload as string) ?? "Could not remove this item";
      })

      .addCase(clearCartThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptCart(action.payload));
      })
      .addCase(clearCartThunk.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Could not clear your cart";
      })

      // Cross-slice: a wishlist "move to cart" also updates the cart.
      .addMatcher(
        (action): action is { type: "wishlist/moveToCart/fulfilled"; payload: { cart: CartApi } } =>
          action.type === "wishlist/moveToCart/fulfilled",
        (state, action) => {
          Object.assign(state, adaptCart(action.payload.cart));
        }
      )
      // Cross-slice: reordering a past order also updates the cart.
      .addMatcher(
        (action): action is { type: "orders/reorder/fulfilled"; payload: { cart: CartApi } } =>
          action.type === "orders/reorder/fulfilled",
        (state, action) => {
          Object.assign(state, adaptCart(action.payload.cart));
        }
      )
      // Reset on logout — either the explicit logoutThunk (fulfilled type
      // "auth/logout/fulfilled") or apiClient's automatic refresh-failure
      // dispatch of the plain "auth/logout" action.
      .addMatcher(
        (action): action is { type: string } =>
          typeof action?.type === "string" && action.type.startsWith("auth/logout"),
        (state) => {
          Object.assign(state, initialState);
        }
      );
  },
});

export const { clearCartError, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
