import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PRODUCTS, CATEGORIES } from "@/data/products";

export interface ProductsState {
  items: typeof PRODUCTS;
  categories: typeof CATEGORIES;
  filters: Record<string, unknown>;
  status: "idle" | "loading" | "error";
}

const initialState: ProductsState = {
  items: PRODUCTS,
  categories: CATEGORIES,
  filters: {},
  status: "idle",
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Record<string, unknown>>) {
      state.filters = action.payload;
    },
  },
});

export const { setFilters } = productsSlice.actions;
export default productsSlice.reducer;
