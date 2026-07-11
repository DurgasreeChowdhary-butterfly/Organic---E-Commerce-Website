import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, ClipboardList, Users, Boxes, Leaf, Store, LogOut, X } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutThunk } from "@/features/auth/authSlice";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, end: false },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, end: false },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector((s) => s.auth.refreshToken);

  return (
    <>
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10">
          <Leaf className="w-5 h-5 text-gold" />
        </div>
        <span className="font-display text-lg text-white">Admin Panel</span>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-pista-700 text-white" : "text-pista-100/80 hover:bg-white/10"
                )
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {l.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-pista-100/70 hover:bg-white/10">
          <Store className="w-4.5 h-4.5" />
          Back to Store
        </NavLink>
        <button
          onClick={() => { dispatch(logoutThunk(refreshToken)); onNavigate?.(); }}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-300 hover:bg-white/10"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log Out
        </button>
      </div>
    </>
  );
}

/** Fixed left navigation for the admin dashboard, with a mobile drawer variant. */
export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  return (
    <>
      <aside className="w-64 bg-forest-700 text-cream p-6 hidden md:flex md:flex-col shrink-0 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-forest-900/50 animate-fade-up" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-forest-700 text-cream p-6 flex flex-col overflow-y-auto animate-scale-in origin-left">
            <button onClick={onMobileClose} aria-label="Close menu" className="self-end mb-4 p-1.5 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
