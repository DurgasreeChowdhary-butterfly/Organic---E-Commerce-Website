import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import productsReducer from "@/features/products/productsSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import addressesReducer from "@/features/addresses/addressesSlice";
import { registerStore } from "./storeRegistry";

/**
 * Root Redux store. Each feature owns its own slice under src/features/*.
 * Auth, products, cart, and wishlist are backed by the real FastAPI backend;
 * orders/addresses are still backed by dummy data (src/data/*).
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

registerStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
