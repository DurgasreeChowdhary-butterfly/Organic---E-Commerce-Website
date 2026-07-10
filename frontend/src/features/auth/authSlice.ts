import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

const STORAGE_KEY = "prakruti_auth_user";

function loadPersistedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: loadPersistedUser(),
  isAuthenticated: !!loadPersistedUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      persistUser(action.payload);
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      persistUser(null);
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      persistUser(state.user);
    },
  },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
