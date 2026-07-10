import { IndianRupee, ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import LowStockAlert from "@/components/admin/LowStockAlert";
import { DASHBOARD_STATS, REVENUE_TREND, ADMIN_ORDERS } from "@/data/admin";
import { STATUS_LABEL, STATUS_COLOR } from "@/data/orders";
import { formatCurrency } from "@/utils/formatCurrency";

export default function AdminDashboardPage() {
  const maxRevenue = Math.max(...REVENUE_TREND.map((r) => r.revenue));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-forest-700">Dashboard</h1>
          <p className="text-sm text-brown-500">Welcome back — here's how the store is doing today.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Revenue (30d)" value={DASHBOARD_STATS.revenue.value} change={DASHBOARD_STATS.revenue.change} trend={DASHBOARD_STATS.revenue.trend} icon={IndianRupee} />
        <StatCard label="Orders" value={DASHBOARD_STATS.orders.value} change={DASHBOARD_STATS.orders.change} trend={DASHBOARD_STATS.orders.trend} icon={ShoppingBag} />
        <StatCard label="Customers" value={DASHBOARD_STATS.customers.value} change={DASHBOARD_STATS.customers.change} trend={DASHBOARD_STATS.customers.trend} icon={Users} />
        <StatCard label="Products" value={DASHBOARD_STATS.products.value} change={DASHBOARD_STATS.products.change} trend={DASHBOARD_STATS.products.trend} icon={Package} />
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

        <LowStockAlert />
      </div>

      <div className="rounded-3xl bg-white shadow-soft p-6 mt-6">
        <h2 className="font-semibold text-forest-700 mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {ADMIN_ORDERS.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm border-b border-beige/60 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="font-medium text-forest-700">{o.order_number}</p>
                <p className="text-xs text-brown-500">{o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${STATUS_COLOR[o.status]}1A`, color: STATUS_COLOR[o.status] }}>
                {STATUS_LABEL[o.status]}
              </span>
              <span className="font-semibold text-forest-700">{formatCurrency(o.total_amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
