import { createSlice } from "@reduxjs/toolkit";

// TODO: add createAsyncThunk actions that call services/cartService.ts
// and populate this slice's state (loading/success/error handling).

export interface CartState {
  items: []; // TODO: type as CartItem[]
  subtotal: number;
  status: "idle" | "loading" | "error";
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  status: "idle",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // TODO: add synchronous reducers (e.g. clearCart, resetStatus)
  },
  extraReducers: () => {
    // TODO: wire up async thunk lifecycle actions
  },
});

export default cartSlice.reducer;
