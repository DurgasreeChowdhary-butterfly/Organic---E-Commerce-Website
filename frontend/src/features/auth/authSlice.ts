import { createSlice } from "@reduxjs/toolkit";

// TODO: add createAsyncThunk actions that call services/authService.ts
// and populate this slice's state (loading/success/error handling).

export interface AuthState {
  user: null; // TODO: type as User
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "error";
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // TODO: add synchronous reducers (e.g. clearCart, resetStatus)
  },
  extraReducers: () => {
    // TODO: wire up async thunk lifecycle actions
  },
});

export default authSlice.reducer;
