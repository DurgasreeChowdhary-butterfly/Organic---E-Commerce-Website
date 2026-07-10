import { createSlice } from "@reduxjs/toolkit";

// TODO: add createAsyncThunk actions that call services/ordersService.ts
// and populate this slice's state (loading/success/error handling).

export interface OrdersState {
  items: []; // TODO: type as Order[]
  status: "idle" | "loading" | "error";
}

const initialState: OrdersState = {
  items: [],
  status: "idle",
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // TODO: add synchronous reducers (e.g. clearCart, resetStatus)
  },
  extraReducers: () => {
    // TODO: wire up async thunk lifecycle actions
  },
});

export default ordersSlice.reducer;
