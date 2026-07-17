import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import wishlistReducer from "@/features/wishlist/wishlistSlice";
import productsReducer from "@/features/products/productsSlice";
import ordersReducer from "@/features/orders/ordersSlice";
import addressesReducer from "@/features/addresses/addressesSlice";
import couponReducer from "@/features/coupon/couponSlice";
import inventoryReducer from "@/features/inventory/inventorySlice";
import affiliateReducer from "@/features/affiliate/affiliateSlice";
import { registerStore } from "./storeRegistry";

/**
 * Root Redux store. Each feature owns its own slice under src/features/*.
 * Every slice is backed by the real FastAPI backend.
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
    inventory: inventoryReducer,
    affiliate: affiliateReducer,
  },
});

registerStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
