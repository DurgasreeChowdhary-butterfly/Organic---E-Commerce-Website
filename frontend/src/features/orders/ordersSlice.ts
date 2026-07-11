import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as orderService from "@/services/orderService";
import * as adminService from "@/services/adminService";
import type { AdminOrderListItem, Order, OrderListItem, OrderStatus } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface OrdersState {
  items: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status: AsyncStatus;
  error: string | null;

  currentOrder: Order | null;
  detailStatus: AsyncStatus;
  detailError: string | null;
  mutatingOrderId: string | null;
  reorderSkipped: string[];

  adminItems: AdminOrderListItem[];
  adminTotal: number;
  adminPage: number;
  adminPageSize: number;
  adminTotalPages: number;
  adminStatus: AsyncStatus;
  adminError: string | null;
  adminMutatingId: string | null;
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  status: "idle",
  error: null,

  currentOrder: null,
  detailStatus: "idle",
  detailError: null,
  mutatingOrderId: null,
  reorderSkipped: [],

  adminItems: [],
  adminTotal: 0,
  adminPage: 1,
  adminPageSize: 20,
  adminTotalPages: 1,
  adminStatus: "idle",
  adminError: null,
  adminMutatingId: null,
};

// ---------- Customer ----------

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetch",
  async (params: orderService.OrderListParams, { rejectWithValue }) => {
    try {
      return await orderService.getOrders(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load your orders"));
    }
  }
);

export const fetchOrderThunk = createAsyncThunk(
  "orders/fetchOne",
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await orderService.getOrder(orderId);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load this order"));
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  "orders/cancel",
  async ({ orderId, reason }: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder(orderId, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not cancel this order"));
    }
  }
);

export const reorderThunk = createAsyncThunk(
  "orders/reorder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      return await orderService.reorder(orderId);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not add these items to your cart"));
    }
  }
);

// ---------- Admin ----------

export const adminFetchOrdersThunk = createAsyncThunk(
  "orders/adminFetch",
  async (params: adminService.AdminOrderListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListOrders(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load orders"));
    }
  }
);

export const adminUpdateOrderStatusThunk = createAsyncThunk(
  "orders/adminUpdateStatus",
  async ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminUpdateOrderStatus(orderId, status, note);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update order status"));
    }
  }
);

export const adminCancelOrderThunk = createAsyncThunk(
  "orders/adminCancel",
  async ({ orderId, reason }: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminCancelOrder(orderId, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not cancel this order"));
    }
  }
);

export const adminRefundOrderThunk = createAsyncThunk(
  "orders/adminRefund",
  async ({ orderId, reason }: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      return await adminService.adminRefundOrder(orderId, reason);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not refund this order"));
    }
  }
);

function patchListItemStatus(state: OrdersState, order: Order) {
  const idx = state.items.findIndex((o) => o.id === order.id);
  if (idx !== -1) state.items[idx] = { ...state.items[idx], status: order.status };
}

function patchAdminListItemStatus(state: OrdersState, order: Order) {
  const idx = state.adminItems.findIndex((o) => o.id === order.id);
  if (idx !== -1) state.adminItems[idx] = { ...state.adminItems[idx], status: order.status };
}

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrdersError(state) {
      state.error = null;
    },
    clearOrderDetailError(state) {
      state.detailError = null;
    },
    clearAdminOrdersError(state) {
      state.adminError = null;
    },
    clearReorderSkipped(state) {
      state.reorderSkipped = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.page_size;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load your orders";
      })

      .addCase(fetchOrderThunk.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchOrderThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderThunk.rejected, (state, action) => {
        state.detailStatus = "error";
        state.detailError = (action.payload as string) ?? "Could not load this order";
      })

      .addCase(cancelOrderThunk.pending, (state, action) => {
        state.detailError = null;
        state.mutatingOrderId = action.meta.arg.orderId;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.mutatingOrderId = null;
        if (state.currentOrder?.id === action.payload.id) state.currentOrder = action.payload;
        patchListItemStatus(state, action.payload);
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.mutatingOrderId = null;
        state.detailError = (action.payload as string) ?? "Could not cancel this order";
      })

      .addCase(reorderThunk.pending, (state, action) => {
        state.detailError = null;
        state.mutatingOrderId = action.meta.arg;
      })
      .addCase(reorderThunk.fulfilled, (state, action) => {
        state.mutatingOrderId = null;
        state.reorderSkipped = action.payload.skipped;
      })
      .addCase(reorderThunk.rejected, (state, action) => {
        state.mutatingOrderId = null;
        state.detailError = (action.payload as string) ?? "Could not add these items to your cart";
      })

      .addCase(adminFetchOrdersThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminFetchOrdersThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminItems = action.payload.items;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminPageSize = action.payload.page_size;
        state.adminTotalPages = action.payload.total_pages;
      })
      .addCase(adminFetchOrdersThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not load orders";
      })

      .addCase(adminUpdateOrderStatusThunk.pending, (state, action) => {
        state.adminError = null;
        state.adminMutatingId = action.meta.arg.orderId;
      })
      .addCase(adminUpdateOrderStatusThunk.fulfilled, (state, action) => {
        state.adminMutatingId = null;
        patchAdminListItemStatus(state, action.payload);
        if (state.currentOrder?.id === action.payload.id) state.currentOrder = action.payload;
      })
      .addCase(adminUpdateOrderStatusThunk.rejected, (state, action) => {
        state.adminMutatingId = null;
        state.adminError = (action.payload as string) ?? "Could not update order status";
      })

      .addCase(adminCancelOrderThunk.pending, (state, action) => {
        state.adminError = null;
        state.adminMutatingId = action.meta.arg.orderId;
      })
      .addCase(adminCancelOrderThunk.fulfilled, (state, action) => {
        state.adminMutatingId = null;
        patchAdminListItemStatus(state, action.payload);
      })
      .addCase(adminCancelOrderThunk.rejected, (state, action) => {
        state.adminMutatingId = null;
        state.adminError = (action.payload as string) ?? "Could not cancel this order";
      })

      .addCase(adminRefundOrderThunk.pending, (state, action) => {
        state.adminError = null;
        state.adminMutatingId = action.meta.arg.orderId;
      })
      .addCase(adminRefundOrderThunk.fulfilled, (state, action) => {
        state.adminMutatingId = null;
        patchAdminListItemStatus(state, action.payload);
      })
      .addCase(adminRefundOrderThunk.rejected, (state, action) => {
        state.adminMutatingId = null;
        state.adminError = (action.payload as string) ?? "Could not refund this order";
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

export const { clearOrdersError, clearOrderDetailError, clearAdminOrdersError, clearReorderSkipped } = ordersSlice.actions;
export default ordersSlice.reducer;
