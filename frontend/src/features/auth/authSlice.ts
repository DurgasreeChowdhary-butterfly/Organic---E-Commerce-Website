import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import * as authService from "@/services/authService";
import type { User } from "@/types";

const STORAGE_KEY = "prakruti_auth";

interface PersistedAuth {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

function loadPersisted(): PersistedAuth {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedAuth) : { user: null, accessToken: null, refreshToken: null };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function persist(state: PersistedAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearPersisted() {
  localStorage.removeItem(STORAGE_KEY);
}

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "error";
  error: string | null;
}

const persisted = loadPersisted();

const initialState: AuthState = {
  user: persisted.user,
  accessToken: persisted.accessToken,
  refreshToken: persisted.refreshToken,
  isAuthenticated: !!persisted.accessToken && !!persisted.user,
  status: "idle",
  error: null,
};

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: authService.RegisterPayload, { rejectWithValue }) => {
    try {
      return await authService.register(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Registration failed"));
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: authService.LoginPayload, { rejectWithValue }) => {
    try {
      return await authService.login(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Incorrect email or password"));
    }
  }
);

export const fetchMeThunk = createAsyncThunk("auth/fetchMe", async (_: void, { rejectWithValue }) => {
  try {
    return await authService.getMe();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not load profile"));
  }
});

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (payload: authService.UpdateProfilePayload, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update profile"));
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async (refreshToken: string | null) => {
  if (refreshToken) {
    await authService.logout(refreshToken).catch(() => undefined);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      persist({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
      clearPersisted();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        persist({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Registration failed";
      })

      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        persist({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Incorrect email or password";
      })

      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        persist({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        // Access token is invalid/expired and refresh already failed (the
        // apiClient interceptor logs out on refresh failure) — nothing to
        // update here beyond leaving whatever state logout() already set.
        state.status = "idle";
      })

      .addCase(updateProfileThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        persist({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken });
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not update profile";
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
        clearPersisted();
      });
  },
});

export const { setTokens, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
