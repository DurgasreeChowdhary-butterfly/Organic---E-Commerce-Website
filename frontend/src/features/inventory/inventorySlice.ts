import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as adminService from "@/services/adminService";
import type { InventoryItem, InventoryTransaction } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface InventoryState {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status: AsyncStatus;
  error: string | null;
  mutatingId: string | null;

  history: InventoryTransaction[];
  historyProductId: string | null;
  historyTotal: number;
  historyPage: number;
  historyPageSize: number;
  historyTotalPages: number;
  historyStatus: AsyncStatus;
  historyError: string | null;
}

const initialState: InventoryState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  status: "idle",
  error: null,
  mutatingId: null,

  history: [],
  historyProductId: null,
  historyTotal: 0,
  historyPage: 1,
  historyPageSize: 20,
  historyTotalPages: 1,
  historyStatus: "idle",
  historyError: null,
};

export const adminFetchInventoryThunk = createAsyncThunk(
  "inventory/adminFetch",
  async (params: adminService.AdminInventoryListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListInventory(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load inventory"));
    }
  }
);

export const adminIncreaseStockThunk = createAsyncThunk(
  "inventory/adminIncrease",
  async ({ productId, quantity, reason }: { productId: string; quantity: number; reason: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminIncreaseStock(productId, quantity, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not increase stock"));
    }
  }
);

export const adminDecreaseStockThunk = createAsyncThunk(
  "inventory/adminDecrease",
  async ({ productId, quantity, reason }: { productId: string; quantity: number; reason: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminDecreaseStock(productId, quantity, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not decrease stock"));
    }
  }
);

export const adminCorrectStockThunk = createAsyncThunk(
  "inventory/adminCorrect",
  async ({ productId, newQuantity, reason }: { productId: string; newQuantity: number; reason: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminCorrectStock(productId, newQuantity, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not correct stock"));
    }
  }
);

export const adminFetchInventoryHistoryThunk = createAsyncThunk(
  "inventory/adminFetchHistory",
  async ({ productId, page, pageSize }: { productId: string; page?: number; pageSize?: number }, { rejectWithValue }) => {
    try {
      const data = await adminService.adminGetInventoryHistory(productId, { page, page_size: pageSize });
      return { productId, data };
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load stock history"));
    }
  }
);

function patchItem(state: InventoryState, item: InventoryItem) {
  const idx = state.items.findIndex((i) => i.id === item.id);
  if (idx !== -1) state.items[idx] = item;
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearInventoryError(state) {
      state.error = null;
    },
    clearInventoryHistory(state) {
      state.history = [];
      state.historyProductId = null;
      state.historyStatus = "idle";
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminFetchInventoryThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(adminFetchInventoryThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.page_size;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(adminFetchInventoryThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load inventory";
      })

      .addCase(adminIncreaseStockThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg.productId;
      })
      .addCase(adminIncreaseStockThunk.fulfilled, (state, action) => {
        state.mutatingId = null;
        patchItem(state, action.payload);
      })
      .addCase(adminIncreaseStockThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not increase stock";
      })

      .addCase(adminDecreaseStockThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg.productId;
      })
      .addCase(adminDecreaseStockThunk.fulfilled, (state, action) => {
        state.mutatingId = null;
        patchItem(state, action.payload);
      })
      .addCase(adminDecreaseStockThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not decrease stock";
      })

      .addCase(adminCorrectStockThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg.productId;
      })
      .addCase(adminCorrectStockThunk.fulfilled, (state, action) => {
        state.mutatingId = null;
        patchItem(state, action.payload);
      })
      .addCase(adminCorrectStockThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not correct stock";
      })

      .addCase(adminFetchInventoryHistoryThunk.pending, (state, action) => {
        state.historyStatus = "loading";
        state.historyError = null;
        state.historyProductId = action.meta.arg.productId;
      })
      .addCase(adminFetchInventoryHistoryThunk.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload.data.items;
        state.historyTotal = action.payload.data.total;
        state.historyPage = action.payload.data.page;
        state.historyPageSize = action.payload.data.page_size;
        state.historyTotalPages = action.payload.data.total_pages;
      })
      .addCase(adminFetchInventoryHistoryThunk.rejected, (state, action) => {
        state.historyStatus = "error";
        state.historyError = (action.payload as string) ?? "Could not load stock history";
      })

      .addMatcher(
        (action): action is { type: string } =>
          typeof action?.type === "string" && action.type.startsWith("auth/logout"),
        (state) => {
          Object.assign(state, initialState);
        }
      );
  },
});

export const { clearInventoryError, clearInventoryHistory } = inventorySlice.actions;
export default inventorySlice.reducer;
