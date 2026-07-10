import { createSlice } from "@reduxjs/toolkit";

// TODO: add createAsyncThunk actions that call services/wishlistService.ts
// and populate this slice's state (loading/success/error handling).

export interface WishlistState {
  items: []; // TODO: type as Product[]
  status: "idle" | "loading" | "error";
}

const initialState: WishlistState = {
  items: [],
  status: "idle",
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // TODO: add synchronous reducers (e.g. clearCart, resetStatus)
  },
  extraReducers: () => {
    // TODO: wire up async thunk lifecycle actions
  },
});

export default wishlistSlice.reducer;
