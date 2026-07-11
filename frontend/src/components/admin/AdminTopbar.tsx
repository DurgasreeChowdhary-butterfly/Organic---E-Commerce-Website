import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Menu, LogOut, Store, AlertTriangle, PackageCheck } from "lucide-react";
import { ADMIN_ORDERS } from "@/data/admin";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import * as adminService from "@/services/adminService";
import type { DummyProduct } from "@/data/products";

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

/** Admin topbar: search, notifications, admin user menu. */
export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, refreshToken } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [lowStockProducts, setLowStockProducts] = useState<DummyProduct[]>([]);

  useEffect(() => {
    adminService.adminListProducts({ page_size: 100 }).then((res) => {
      setLowStockProducts(res.items.filter((p) => p.stock_quantity < 10));
    });
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) navigate(`/admin/products?search=${encodeURIComponent(search.trim())}`);
  }

  function handleLogout() {
    dispatch(logoutThunk(refreshToken));
    navigate("/login");
  }

  const recentOrders = ADMIN_ORDERS.slice(0, 3);
  const notifCount = lowStockProducts.length + recentOrders.length;

  return (
    <header className="bg-white shadow-soft px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20 gap-3">
      <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-full hover:bg-beige/60 shrink-0" aria-label="Open menu">
        <Menu className="w-5 h-5 text-forest-700" />
      </button>

      <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full px-4 py-2 bg-beige/60 w-full max-w-xs">
        <Search className="w-4 h-4 text-brown-500 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, products..."
          className="bg-transparent text-sm outline-none w-full placeholder:text-brown-500/70"
        />
      </form>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="relative p-2 rounded-full hover:bg-beige/60" aria-label="Notifications" aria-expanded={notifOpen}>
            <Bell className="w-5 h-5 text-forest-700" />
            {notifCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-soft-orange" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-glass overflow-hidden z-50 animate-scale-in origin-top-right">
              <div className="px-4 py-3 border-b border-beige font-semibold text-sm text-forest-700">Notifications</div>
              <div className="max-h-72 overflow-y-auto">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-beige/60 text-sm">
                    <AlertTriangle className="w-4 h-4 text-soft-orange shrink-0 mt-0.5" />
                    <span className="text-forest-700">{p.name} is low on stock ({p.stock_quantity} left)</span>
                  </div>
                ))}
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-beige/60 last:border-0 text-sm">
                    <PackageCheck className="w-4 h-4 text-pista-700 shrink-0 mt-0.5" />
                    <span className="text-forest-700">Order {o.order_number} is {o.status.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-2.5" aria-expanded={userOpen}>
            <div className="w-9 h-9 rounded-full bg-forest-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {(user?.full_name ?? "A").charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-forest-700 leading-tight">{user?.full_name ?? "Admin"}</div>
              <div className="text-xs text-brown-500 leading-tight">{user?.email}</div>
            </div>
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-glass overflow-hidden z-50 animate-scale-in origin-top-right">
              <button onClick={() => { setUserOpen(false); navigate("/"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest-700 hover:bg-pista-50 transition-colors">
                <Store className="w-4 h-4" /> View Store
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-beige">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
