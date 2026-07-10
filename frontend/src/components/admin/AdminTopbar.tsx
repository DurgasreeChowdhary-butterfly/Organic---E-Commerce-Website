import { Bell, Search } from "lucide-react";
import { CURRENT_USER } from "@/data/orders";

/** Admin topbar: search, notifications, admin user chip. */
export default function AdminTopbar() {
  return (
    <header className="bg-white shadow-soft px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-beige/60 w-full max-w-xs">
        <Search className="w-4 h-4 text-brown-500" />
        <input placeholder="Search orders, products..." className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70" />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-beige/60" aria-label="Notifications">
          <Bell className="w-5 h-5 text-forest-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-soft-orange" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center text-sm font-semibold">
            {CURRENT_USER.full_name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-forest-700 leading-tight">Admin</div>
            <div className="text-xs text-brown-500 leading-tight">{CURRENT_USER.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
