import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import LowStockAlert from "@/components/admin/LowStockAlert";
import Skeleton from "@/components/common/Skeleton";
import { DASHBOARD_STATS, REVENUE_TREND } from "@/data/admin";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import { useLoading } from "@/hooks/useLoading";
import * as adminService from "@/services/adminService";
import type { DummyProduct } from "@/data/products";
import type { AdminOrderListItem } from "@/types";

const LOW_STOCK_THRESHOLD = 10;

export default function AdminDashboardPage() {
  const maxRevenue = Math.max(...REVENUE_TREND.map((r) => r.revenue));
  const loading = useLoading(300);

  const [products, setProducts] = useState<DummyProduct[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<AdminOrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    adminService
      .adminListProducts({ page_size: 100 })
      .then((res) => {
        setProducts(res.items);
        setProductTotal(res.total);
      })
      .finally(() => setProductsLoading(false));

    adminService
      .adminListOrders({ page: 1, page_size: 5 })
      .then((res) => setRecentOrders(res.items))
      .finally(() => setOrdersLoading(false));
  }, []);

  const lowStockProducts = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < LOW_STOCK_THRESHOLD || p.stock_quantity === 0);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Dashboard</h1>
          <p className="text-sm text-brown-500">Welcome back — here's how the store is doing today.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (30d)" value={DASHBOARD_STATS.revenue.value} change={DASHBOARD_STATS.revenue.change} trend={DASHBOARD_STATS.revenue.trend} icon={IndianRupee} to="/admin/orders" />
        <StatCard label="Orders" value={DASHBOARD_STATS.orders.value} change={DASHBOARD_STATS.orders.change} trend={DASHBOARD_STATS.orders.trend} icon={ShoppingBag} to="/admin/orders" />
        <StatCard label="Customers" value={DASHBOARD_STATS.customers.value} change={DASHBOARD_STATS.customers.change} trend={DASHBOARD_STATS.customers.trend} icon={Users} to="/admin/customers" />
        <StatCard label="Products" value={productsLoading ? "…" : productTotal.toString()} icon={Package} to="/admin/products" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-forest-700 flex items-center gap-2"><TrendingUp className="w-4.5 h-4.5 text-pista-700" /> Revenue Trend</h2>
            <span className="text-xs text-brown-500">Last 7 months</span>
          </div>
          <div className="flex items-end justify-between gap-3 h-48">
            {REVENUE_TREND.map((r) => (
              <div key={r.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: 160 }}>
                  <div
                    className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-pista-700 to-pista-500 transition-all duration-500"
                    style={{ height: `${(r.revenue / maxRevenue) * 100}%` }}
                    title={formatCurrency(r.revenue)}
                  />
                </div>
                <span className="text-[11px] text-brown-500">{r.month}</span>
              </div>
            ))}
          </div>
        </div>

        <LowStockAlert products={lowStockProducts} loading={productsLoading} />
      </div>

      <div className="rounded-3xl bg-white shadow-soft p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-forest-700">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-pista-700 hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {ordersLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-brown-500 py-4 text-center">No orders yet.</p>
          ) : (
            recentOrders.map((o) => (
              <Link key={o.id} to="/admin/orders" className="flex items-center justify-between text-sm border-b border-beige/60 last:border-0 pb-3 last:pb-0 hover:bg-pista-50/40 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-forest-700">{o.order_number}</p>
                  <p className="text-xs text-brown-500">{o.item_count} item{o.item_count > 1 ? "s" : ""}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${STATUS_COLOR[o.status]}1A`, color: STATUS_COLOR[o.status] }}>
                  {STATUS_LABEL[o.status]}
                </span>
                <span className="font-semibold text-forest-700">{formatCurrency(o.total_amount)}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
