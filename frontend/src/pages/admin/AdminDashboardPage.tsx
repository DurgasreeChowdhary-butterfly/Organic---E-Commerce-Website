import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle2, XCircle, AlertTriangle, PackageX, Award, AlertCircle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import LowStockAlert from "@/components/admin/LowStockAlert";
import Skeleton from "@/components/common/Skeleton";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";
import * as adminService from "@/services/adminService";
import type { DashboardAnalytics } from "@/types";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    adminService
      .getDashboardStats(7)
      .then(setAnalytics)
      .catch(() => setError("Could not load dashboard analytics. Please try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

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

  if (error || !analytics) {
    return (
      <div>
        <h1 className="font-display text-2xl text-forest-700 mb-6">Dashboard</h1>
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error ?? "Could not load dashboard analytics."}
          <button onClick={load} className="text-xs font-semibold underline ml-auto shrink-0">Retry</button>
        </div>
      </div>
    );
  }

  const { stats, recent_orders: recentOrders, top_selling_products: topSelling, low_stock_alerts: lowStockAlerts, sales_trend: salesTrend } = analytics;
  const maxTrendRevenue = Math.max(...salesTrend.map((r) => r.revenue), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Dashboard</h1>
          <p className="text-sm text-brown-500">Welcome back — here's how the store is doing today.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.total_revenue)} icon={IndianRupee} to="/admin/orders" />
        <StatCard label="Total Orders" value={stats.total_orders} icon={ShoppingBag} to="/admin/orders" />
        <StatCard label="Total Customers" value={stats.total_customers} icon={Users} to="/admin/customers" />
        <StatCard label="Total Products" value={stats.total_products} icon={Package} to="/admin/products" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Pending Orders" value={stats.pending_orders} icon={Clock} to="/admin/orders" />
        <StatCard label="Delivered Orders" value={stats.delivered_orders} icon={CheckCircle2} to="/admin/orders" />
        <StatCard label="Cancelled Orders" value={stats.cancelled_orders} icon={XCircle} to="/admin/orders" />
        <StatCard label="Low Stock Products" value={stats.low_stock_products} icon={AlertTriangle} to="/admin/inventory" />
        <StatCard label="Out of Stock Products" value={stats.out_of_stock_products} icon={PackageX} to="/admin/inventory" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-forest-700 flex items-center gap-2"><TrendingUp className="w-4.5 h-4.5 text-pista-700" /> Sales Trend</h2>
            <span className="text-xs text-brown-500">Last {salesTrend.length} days</span>
          </div>
          {salesTrend.every((r) => r.revenue === 0) ? (
            <p className="text-sm text-brown-500 py-16 text-center">No sales recorded in this period yet.</p>
          ) : (
            <div className="flex items-end justify-between gap-3 h-48">
              {salesTrend.map((r) => (
                <div key={r.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center" style={{ height: 160 }}>
                    <div
                      className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-pista-700 to-pista-500 transition-all duration-500"
                      style={{ height: `${(r.revenue / maxTrendRevenue) * 100}%` }}
                      title={`${formatCurrency(r.revenue)} · ${r.order_count} order${r.order_count === 1 ? "" : "s"}`}
                    />
                  </div>
                  <span className="text-[11px] text-brown-500">
                    {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <LowStockAlert products={lowStockAlerts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-3xl bg-white shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-forest-700">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-pista-700 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-brown-500 py-4 text-center">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <Link key={o.id} to="/admin/orders" className="flex items-center justify-between text-sm border-b border-beige/60 last:border-0 pb-3 last:pb-0 hover:bg-pista-50/40 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-forest-700">{o.order_number}</p>
                    <p className="text-xs text-brown-500 truncate">{o.customer_name}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 mx-2" style={{ background: `${STATUS_COLOR[o.status]}1A`, color: STATUS_COLOR[o.status] }}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  <span className="font-semibold text-forest-700 shrink-0">{formatCurrency(o.total_amount)}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4.5 h-4.5 text-gold" />
            <h2 className="font-semibold text-forest-700">Top Selling Products</h2>
          </div>
          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-sm text-brown-500 py-4 text-center">No sales recorded yet.</p>
            ) : (
              topSelling.map((p, i) => (
                <div key={p.product_id ?? `${p.sku}-${i}`} className="flex items-center justify-between text-sm border-b border-beige/60 last:border-0 pb-3 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium text-forest-700 truncate">{p.name}</p>
                    <p className="text-xs text-brown-500">{p.sku} · {p.quantity_sold} sold</p>
                  </div>
                  <span className="font-semibold text-forest-700 shrink-0">{formatCurrency(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
