import { createSlice } from "@reduxjs/toolkit";

// TODO: add createAsyncThunk actions that call services/productsService.ts
// and populate this slice's state (loading/success/error handling).

export interface ProductsState {
  items: []; // TODO: type as Product[]
  categories: [];
  filters: Record<string, unknown>;
  status: "idle" | "loading" | "error";
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  filters: {},
  status: "idle",
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // TODO: add synchronous reducers (e.g. clearCart, resetStatus)
  },
  extraReducers: () => {
    // TODO: wire up async thunk lifecycle actions
  },
});

export default productsSlice.reducer;
