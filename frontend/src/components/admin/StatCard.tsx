import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon?: LucideIcon;
  to?: string;
}

/** Dashboard metric card (Revenue, Orders, Customers, etc). Links to a detail page when `to` is set. */
export default function StatCard({ label, value, change, trend, icon: Icon, to }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-brown-500 font-medium">{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-full bg-pista-50 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-pista-700" />
          </div>
        )}
      </div>
      <div className="text-2xl font-display text-forest-700">{value}</div>
      {change && (
        <div className={clsx("flex items-center gap-1 text-xs font-semibold mt-2", trend === "up" ? "text-pista-700" : "text-soft-orange")}>
          {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {change}
        </div>
      )}
    </>
  );

  const className = "block rounded-3xl bg-white shadow-soft p-6 hover:shadow-glass transition-shadow";

  return to ? <Link to={to} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}
