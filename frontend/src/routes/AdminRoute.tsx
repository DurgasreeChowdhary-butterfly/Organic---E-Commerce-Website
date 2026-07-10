import { Navigate, Outlet } from "react-router-dom";

/**
 * Guards /admin/* routes. TODO: verify current user has is_admin = true.
 */
export default function AdminRoute() {
  const isAdmin = false; // TODO: useAppSelector((s) => s.auth.user?.is_admin)

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
