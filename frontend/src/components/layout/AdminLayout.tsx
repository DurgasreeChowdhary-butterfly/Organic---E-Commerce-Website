import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

/**
 * Shell for the admin dashboard: fixed sidebar nav + topbar, content via
 * <Outlet />. Separate visual language from the customer storefront.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-beige">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
