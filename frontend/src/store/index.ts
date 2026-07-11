import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import productsReducer from "@/features/products/productsSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import addressesReducer from "@/features/addresses/addressesSlice";
import couponReducer from "@/features/coupon/couponSlice";
import { registerStore } from "./storeRegistry";

/**
 * Root Redux store. Each feature owns its own slice under src/features/*.
 * Auth, products, cart, wishlist, addresses, and coupon are backed by the
 * real FastAPI backend; orders is still backed by dummy data (src/data/*).
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    products: productsReducer,
    orders: ordersReducer,
    addresses: addressesReducer,
    coupon: couponReducer,
  },
});

registerStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
