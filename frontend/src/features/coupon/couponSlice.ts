import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as couponService from "@/services/couponService";
import * as adminService from "@/services/adminService";
import type { Coupon, DiscountType } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface CouponState {
  // Customer-facing: coupon applied at checkout.
  code: string | null;
  discountType: DiscountType | null;
  discountValue: number | null;
  discountAmount: number;
  message: string | null;
  status: AsyncStatus;
  error: string | null;

  // Admin: coupon management table.
  adminItems: Coupon[];
  adminTotal: number;
  adminPage: number;
  adminPageSize: number;
  adminTotalPages: number;
  adminStatus: AsyncStatus;
  adminError: string | null;
}

const appliedInitialState = {
  code: null as string | null,
  discountType: null as DiscountType | null,
  discountValue: null as number | null,
  discountAmount: 0,
  message: null as string | null,
  status: "idle" as AsyncStatus,
  error: null as string | null,
};

const initialState: CouponState = {
  ...appliedInitialState,
  adminItems: [],
  adminTotal: 0,
  adminPage: 1,
  adminPageSize: 20,
  adminTotalPages: 1,
  adminStatus: "idle",
  adminError: null,
};

// ---------- Customer: apply/validate ----------

export const applyCouponThunk = createAsyncThunk(
  "coupon/apply",
  async (code: string, { rejectWithValue }) => {
    try {
      return await couponService.validateCoupon(code);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not apply this coupon"));
    }
  }
);

// ---------- Admin: coupon management ----------

export const adminFetchCouponsThunk = createAsyncThunk(
  "coupon/adminFetch",
  async (params: adminService.AdminCouponListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListCoupons(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load coupons"));
    }
  }
);

export const adminCreateCouponThunk = createAsyncThunk(
  "coupon/adminCreate",
  async (payload: adminService.AdminCouponInput, { rejectWithValue }) => {
    try {
      return await adminService.adminCreateCoupon(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not create coupon"));
    }
  }
);

export const adminUpdateCouponThunk = createAsyncThunk(
  "coupon/adminUpdate",
  async ({ id, payload }: { id: string; payload: Partial<adminService.AdminCouponInput> }, { rejectWithValue }) => {
    try {
      return await adminService.adminUpdateCoupon(id, payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update coupon"));
    }
  }
);

export const adminDeleteCouponThunk = createAsyncThunk(
  "coupon/adminDelete",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.adminDeleteCoupon(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not delete coupon"));
    }
  }
);

export const adminToggleCouponActiveThunk = createAsyncThunk(
  "coupon/adminToggleActive",
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      return isActive ? await adminService.adminActivateCoupon(id) : await adminService.adminDeactivateCoupon(id);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update coupon status"));
    }
  }
);

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    removeCoupon(state) {
      Object.assign(state, appliedInitialState);
    },
    clearCouponError(state) {
      state.error = null;
    },
    clearAdminCouponError(state) {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCouponThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(applyCouponThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.code = action.payload.code;
        state.discountType = action.payload.discount_type;
        state.discountValue = action.payload.discount_value;
        state.discountAmount = action.payload.discount_amount;
        state.message = action.payload.message;
      })
      .addCase(applyCouponThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not apply this coupon";
      })

      .addCase(adminFetchCouponsThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminFetchCouponsThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminItems = action.payload.items;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminPageSize = action.payload.page_size;
        state.adminTotalPages = action.payload.total_pages;
      })
      .addCase(adminFetchCouponsThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not load coupons";
      })

      .addCase(adminCreateCouponThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not create coupon";
      })
      .addCase(adminUpdateCouponThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not update coupon";
      })

      .addCase(adminDeleteCouponThunk.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.filter((c) => c.id !== action.payload);
        state.adminTotal = Math.max(0, state.adminTotal - 1);
      })
      .addCase(adminDeleteCouponThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not delete coupon";
      })

      .addCase(adminToggleCouponActiveThunk.fulfilled, (state, action) => {
        const idx = state.adminItems.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.adminItems[idx] = action.payload;
      })
      .addCase(adminToggleCouponActiveThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not update coupon status";
      })

      // A cleared/emptied cart invalidates any applied coupon preview.
      .addMatcher(
        (action): action is { type: string } => action.type === "cart/clear/fulfilled",
        (state) => {
          Object.assign(state, appliedInitialState);
        }
      )
      .addMatcher(
        (action): action is { type: string } =>
          typeof action?.type === "string" && action.type.startsWith("auth/logout"),
        (state) => {
          Object.assign(state, initialState);
        }
      );
  },
});

export const { removeCoupon, clearCouponError, clearAdminCouponError } = couponSlice.actions;
export default couponSlice.reducer;
