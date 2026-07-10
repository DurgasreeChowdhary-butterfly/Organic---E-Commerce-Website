import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, FolderTree, ClipboardList, Users, Boxes, Leaf, LogOut } from "lucide-react";
import clsx from "clsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, end: false },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, end: false },
];

/** Fixed left navigation for the admin dashboard. */
export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-forest-700 text-cream p-6 hidden md:flex md:flex-col shrink-0 min-h-screen sticky top-0">
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

      <NavLink to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-pista-100/70 hover:bg-white/10 mt-4">
        <LogOut className="w-4.5 h-4.5" />
        Back to Store
      </NavLink>
    </aside>
  );
}
