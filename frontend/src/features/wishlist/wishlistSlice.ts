import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as wishlistService from "@/services/wishlistService";
import { toDummyProduct } from "@/services/productService";
import type { DummyProduct } from "@/data/products";
import type { WishlistApi } from "@/types";
import type { RootState } from "@/store";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export interface WishlistItem {
  id: string;
  product: DummyProduct;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface WishlistState {
  items: WishlistItem[];
  count: number;
  status: AsyncStatus;
  error: string | null;
  /** Product id currently being toggled/moved — drives per-card loading state. */
  mutatingProductId: string | null;
}

const initialState: WishlistState = {
  items: [],
  count: 0,
  status: "idle",
  error: null,
  mutatingProductId: null,
};

function adaptWishlist(data: WishlistApi) {
  return {
    items: data.items.map((i) => ({ id: i.id, product: toDummyProduct(i.product) })),
    count: data.count,
  };
}

export const fetchWishlistThunk = createAsyncThunk("wishlist/fetch", async (_: void, { rejectWithValue }) => {
  try {
    return await wishlistService.getWishlist();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not load your wishlist"));
  }
});

export const toggleWishlistThunk = createAsyncThunk(
  "wishlist/toggle",
  async (product: DummyProduct, { getState, rejectWithValue }) => {
    const isWishlisted = (getState() as RootState).wishlist.items.some((i) => i.product.id === product.id);
    try {
      const data = isWishlisted
        ? await wishlistService.removeFromWishlist(product.id)
        : await wishlistService.addToWishlist(product.id);
      return data;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update your wishlist"));
    }
  }
);

export const removeFromWishlistThunk = createAsyncThunk(
  "wishlist/removeItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      return await wishlistService.removeFromWishlist(productId);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not remove this item"));
    }
  }
);

export const moveToCartThunk = createAsyncThunk(
  "wishlist/moveToCart",
  async (productId: string, { rejectWithValue }) => {
    try {
      return await wishlistService.moveToCart(productId);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not move this item to your cart"));
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, adaptWishlist(action.payload));
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load your wishlist";
      })

      .addCase(toggleWishlistThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingProductId = action.meta.arg.id;
      })
      .addCase(toggleWishlistThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptWishlist(action.payload));
        state.mutatingProductId = null;
      })
      .addCase(toggleWishlistThunk.rejected, (state, action) => {
        state.mutatingProductId = null;
        state.error = (action.payload as string) ?? "Could not update your wishlist";
      })

      .addCase(removeFromWishlistThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingProductId = action.meta.arg;
      })
      .addCase(removeFromWishlistThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptWishlist(action.payload));
        state.mutatingProductId = null;
      })
      .addCase(removeFromWishlistThunk.rejected, (state, action) => {
        state.mutatingProductId = null;
        state.error = (action.payload as string) ?? "Could not remove this item";
      })

      .addCase(moveToCartThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingProductId = action.meta.arg;
      })
      .addCase(moveToCartThunk.fulfilled, (state, action) => {
        Object.assign(state, adaptWishlist(action.payload.wishlist));
        state.mutatingProductId = null;
      })
      .addCase(moveToCartThunk.rejected, (state, action) => {
        state.mutatingProductId = null;
        state.error = (action.payload as string) ?? "Could not move this item to your cart";
      })

      .addMatcher(
        (action): action is { type: string } =>
          typeof action?.type === "string" && action.type.startsWith("auth/logout"),
        (state) => {
          Object.assign(state, initialState);
        }
      );
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
