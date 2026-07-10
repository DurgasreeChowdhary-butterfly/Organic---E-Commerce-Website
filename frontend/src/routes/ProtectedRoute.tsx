import { Navigate, Outlet } from "react-router-dom";

/**
 * Guards customer-authenticated routes (cart, checkout, orders, account).
 * TODO: read auth state from Redux and redirect to /login if not authenticated.
 */
export default function ProtectedRoute() {
  const isAuthenticated = false; // TODO: useAppSelector((s) => !!s.auth.accessToken)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
