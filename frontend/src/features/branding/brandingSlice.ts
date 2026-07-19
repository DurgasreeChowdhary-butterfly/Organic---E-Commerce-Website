import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as brandingService from "@/services/brandingService";
import * as adminService from "@/services/adminService";
import type { Branding } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export interface BrandingState {
  logoUrl: string | null;
  status: "idle" | "loading" | "succeeded" | "error";
  adminStatus: "idle" | "loading" | "succeeded" | "error";
  adminError: string | null;
}

const initialState: BrandingState = {
  logoUrl: null,
  status: "idle",
  adminStatus: "idle",
  adminError: null,
};

export const fetchBrandingThunk = createAsyncThunk("branding/fetch", async () => {
  return brandingService.getBranding();
});

export const adminUploadLogoThunk = createAsyncThunk(
  "branding/adminUploadLogo",
  async (file: File, { rejectWithValue }) => {
    try {
      return await adminService.adminUploadBrandingLogo(file);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not upload the logo"));
    }
  }
);

export const adminDeleteLogoThunk = createAsyncThunk(
  "branding/adminDeleteLogo",
  async (_: void, { rejectWithValue }) => {
    try {
      return await adminService.adminDeleteBrandingLogo();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not remove the logo"));
    }
  }
);

function applyBranding(state: BrandingState, branding: Branding) {
  state.logoUrl = branding.logo_url;
}

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    clearBrandingAdminError(state) {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandingThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrandingThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        applyBranding(state, action.payload);
      })
      .addCase(fetchBrandingThunk.rejected, (state) => {
        state.status = "error";
      })

      .addCase(adminUploadLogoThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminUploadLogoThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        applyBranding(state, action.payload);
      })
      .addCase(adminUploadLogoThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not upload the logo";
      })

      .addCase(adminDeleteLogoThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminDeleteLogoThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        applyBranding(state, action.payload);
      })
      .addCase(adminDeleteLogoThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not remove the logo";
      });
  },
});

export const { clearBrandingAdminError } = brandingSlice.actions;
export default brandingSlice.reducer;
