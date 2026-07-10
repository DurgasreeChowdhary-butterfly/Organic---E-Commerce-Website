import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import productsReducer from "@/features/products/productsSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import addressesReducer from "@/features/addresses/addressesSlice";

/**
 * Root Redux store. Each feature owns its own slice under src/features/*.
 * All slices are backed by dummy data (src/data/*) and persist to
 * localStorage so state survives a refresh — there is no real backend yet.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productsReducer,
    orders: ordersReducer,
    addresses: addressesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
