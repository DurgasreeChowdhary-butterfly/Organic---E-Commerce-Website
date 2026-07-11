import { useEffect } from "react";
import AppRoutes from "@/routes/AppRoutes";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeThunk } from "@/features/auth/authSlice";
import { fetchCategoriesThunk } from "@/features/products/productsSlice";
import { fetchCartThunk } from "@/features/cart/cartSlice";
import { fetchWishlistThunk } from "@/features/wishlist/wishlistSlice";

/**
 * Root application component. Global providers (Redux, Router) are
 * mounted in main.tsx; this component owns app-wide chrome like the
 * floating WhatsApp button and AI chatbot widget.
 */
export default function App() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    // Revalidate the persisted session on load — also refreshes stale user
    // fields, and transparently rotates the access token via apiClient's
    // interceptor if it has already expired.
    if (accessToken) {
      dispatch(fetchMeThunk());
    }
    // Categories power the header nav, footer links, and product filters —
    // fetch once here rather than duplicating the call in each component.
    dispatch(fetchCategoriesThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Cart/wishlist are user-scoped on the backend — (re)load them whenever
    // auth flips true, whether from login, registration, or a valid
    // persisted session. The slices reset themselves on logout.
    if (isAuthenticated) {
      dispatch(fetchCartThunk());
      dispatch(fetchWishlistThunk());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <AppRoutes />
      <WhatsAppButton />
      <ChatbotWidget />
    </>
  );
}
