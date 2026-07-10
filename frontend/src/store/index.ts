import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import productsReducer from "@/features/products/productsSlice";
import ordersReducer from "@/features/orders/ordersSlice";

/**
 * Root Redux store. Each feature owns its own slice under src/features/*.
 * TODO: add RTK Query API slice(s) for data fetching/caching if preferred
 * over the axios-based services/ layer.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productsReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
