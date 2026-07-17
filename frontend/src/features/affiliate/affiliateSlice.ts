import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as affiliateService from "@/services/affiliateService";
import * as adminService from "@/services/adminService";
import type { Affiliate, AffiliateAdmin, AffiliateDashboard, AttributedOrderSummary, Commission } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface AffiliateState {
  // Own affiliate profile (null = not registered as an affiliate yet)
  profile: Affiliate | null;
  dashboard: AffiliateDashboard | null;
  orders: AttributedOrderSummary[];
  status: AsyncStatus;
  error: string | null;

  // Admin: affiliate management table
  adminItems: AffiliateAdmin[];
  adminTotal: number;
  adminPage: number;
  adminPageSize: number;
  adminTotalPages: number;
  adminStatus: AsyncStatus;
  adminError: string | null;

  // Admin: commission ledger
  adminCommissions: Commission[];
  adminCommissionsTotal: number;
  adminCommissionsStatus: AsyncStatus;
}

const initialState: AffiliateState = {
  profile: null,
  dashboard: null,
  orders: [],
  status: "idle",
  error: null,
  adminItems: [],
  adminTotal: 0,
  adminPage: 1,
  adminPageSize: 20,
  adminTotalPages: 1,
  adminStatus: "idle",
  adminError: null,
  adminCommissions: [],
  adminCommissionsTotal: 0,
  adminCommissionsStatus: "idle",
};

// ---------- Customer: own affiliate profile ----------

export const registerAffiliateThunk = createAsyncThunk("affiliate/register", async (_: void, { rejectWithValue }) => {
  try {
    return await affiliateService.registerAffiliate();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not register as an affiliate"));
  }
});

export const fetchMyAffiliateThunk = createAsyncThunk("affiliate/fetchMe", async (_: void, { rejectWithValue }) => {
  try {
    return await affiliateService.getMyAffiliateProfile();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Not registered as an affiliate"));
  }
});

export const fetchAffiliateDashboardThunk = createAsyncThunk(
  "affiliate/fetchDashboard",
  async (_: void, { rejectWithValue }) => {
    try {
      return await affiliateService.getAffiliateDashboard();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load your affiliate dashboard"));
    }
  }
);

export const fetchAffiliateOrdersThunk = createAsyncThunk(
  "affiliate/fetchOrders",
  async (_: void, { rejectWithValue }) => {
    try {
      return await affiliateService.getAffiliateOrders();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load attributed orders"));
    }
  }
);

// ---------- Admin: affiliate management ----------

export const adminFetchAffiliatesThunk = createAsyncThunk(
  "affiliate/adminFetch",
  async (params: adminService.AdminAffiliateListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListAffiliates(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load affiliates"));
    }
  }
);

export const adminApproveAffiliateThunk = createAsyncThunk(
  "affiliate/adminApprove",
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.adminApproveAffiliate(id);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not approve affiliate"));
    }
  }
);

export const adminRejectAffiliateThunk = createAsyncThunk(
  "affiliate/adminReject",
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.adminRejectAffiliate(id);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not reject affiliate"));
    }
  }
);

export const adminBlockAffiliateThunk = createAsyncThunk(
  "affiliate/adminBlock",
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.adminBlockAffiliate(id);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not block affiliate"));
    }
  }
);

export const adminUpdateAffiliateCommissionThunk = createAsyncThunk(
  "affiliate/adminUpdateCommission",
  async ({ id, commissionPercentage }: { id: string; commissionPercentage: number }, { rejectWithValue }) => {
    try {
      return await adminService.adminUpdateAffiliateCommission(id, commissionPercentage);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update commission %"));
    }
  }
);

export const adminFetchCommissionsThunk = createAsyncThunk(
  "affiliate/adminFetchCommissions",
  async (params: adminService.AdminCommissionListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListCommissions(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load commissions"));
    }
  }
);

export const adminMarkCommissionPaidThunk = createAsyncThunk(
  "affiliate/adminMarkCommissionPaid",
  async (id: string, { rejectWithValue }) => {
    try {
      return await adminService.adminMarkCommissionPaid(id);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not mark commission as paid"));
    }
  }
);

const affiliateSlice = createSlice({
  name: "affiliate",
  initialState,
  reducers: {
    clearAffiliateError(state) {
      state.error = null;
    },
    clearAdminAffiliateError(state) {
      state.adminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAffiliateThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerAffiliateThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(registerAffiliateThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not register as an affiliate";
      })

      .addCase(fetchMyAffiliateThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchMyAffiliateThunk.rejected, (state) => {
        state.profile = null;
      })

      .addCase(fetchAffiliateDashboardThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAffiliateDashboardThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload;
      })
      .addCase(fetchAffiliateDashboardThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load your affiliate dashboard";
      })

      .addCase(fetchAffiliateOrdersThunk.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      .addCase(adminFetchAffiliatesThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminFetchAffiliatesThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminItems = action.payload.items;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminPageSize = action.payload.page_size;
        state.adminTotalPages = action.payload.total_pages;
      })
      .addCase(adminFetchAffiliatesThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not load affiliates";
      })

      .addCase(adminApproveAffiliateThunk.fulfilled, (state, action) => {
        const idx = state.adminItems.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.adminItems[idx] = action.payload;
      })
      .addCase(adminRejectAffiliateThunk.fulfilled, (state, action) => {
        const idx = state.adminItems.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.adminItems[idx] = action.payload;
      })
      .addCase(adminBlockAffiliateThunk.fulfilled, (state, action) => {
        const idx = state.adminItems.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.adminItems[idx] = action.payload;
      })
      .addCase(adminUpdateAffiliateCommissionThunk.fulfilled, (state, action) => {
        const idx = state.adminItems.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.adminItems[idx] = action.payload;
      })

      .addCase(adminFetchCommissionsThunk.pending, (state) => {
        state.adminCommissionsStatus = "loading";
      })
      .addCase(adminFetchCommissionsThunk.fulfilled, (state, action) => {
        state.adminCommissionsStatus = "succeeded";
        state.adminCommissions = action.payload.items;
        state.adminCommissionsTotal = action.payload.total;
      })
      .addCase(adminFetchCommissionsThunk.rejected, (state) => {
        state.adminCommissionsStatus = "error";
      })

      .addCase(adminMarkCommissionPaidThunk.fulfilled, (state, action) => {
        const idx = state.adminCommissions.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.adminCommissions[idx] = action.payload;
      })

      .addMatcher(
        (action): action is { type: string; payload: string } =>
          [
            adminApproveAffiliateThunk.rejected.type,
            adminRejectAffiliateThunk.rejected.type,
            adminBlockAffiliateThunk.rejected.type,
            adminUpdateAffiliateCommissionThunk.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.adminError = (action.payload as string) ?? "Could not update affiliate";
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

export const { clearAffiliateError, clearAdminAffiliateError } = affiliateSlice.actions;
export default affiliateSlice.reducer;
