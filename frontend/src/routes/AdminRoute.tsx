import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

/** Guards /admin/* routes — requires a logged-in user with is_admin = true. */
export default function AdminRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isAdmin = useAppSelector((s) => !!s.auth.user?.is_admin);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
