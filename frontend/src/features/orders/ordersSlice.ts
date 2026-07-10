import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ORDERS, type DummyOrder } from "@/data/orders";

const STORAGE_KEY = "prakruti_orders";

export interface OrdersState {
  items: DummyOrder[];
}

function loadPersisted(): DummyOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DummyOrder[]) : ORDERS;
  } catch {
    return ORDERS;
  }
}

function persist(items: DummyOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const initialState: OrdersState = {
  items: loadPersisted(),
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    createOrder(state, action: PayloadAction<DummyOrder>) {
      state.items.unshift(action.payload);
      persist(state.items);
    },
    updateOrderStatus(state, action: PayloadAction<{ id: string; status: DummyOrder["status"] }>) {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
      persist(state.items);
    },
  },
});

export const { createOrder, updateOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;
