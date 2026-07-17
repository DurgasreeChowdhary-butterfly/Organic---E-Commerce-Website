import { useEffect, useState } from "react";
import {
  Copy, Check, MousePointerClick, ShoppingBag, IndianRupee, Clock, Wallet, Megaphone,
} from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Button from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMyAffiliateThunk, fetchAffiliateDashboardThunk, fetchAffiliateOrdersThunk, registerAffiliateThunk,
} from "@/features/affiliate/affiliateSlice";
import { fetchProductsThunk } from "@/features/products/productsSlice";
import { formatCurrency } from "@/utils/formatCurrency";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-pista-50 text-pista-700 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-[11px] text-brown-500">{label}</p>
        <p className="text-base font-semibold text-forest-700">{value}</p>
      </div>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-xs font-semibold text-brown-500 mb-1">{label}</p>
      <div className="flex items-center gap-2 rounded-xl border border-beige px-3 py-2.5 bg-pista-50/30">
        <span className="flex-1 text-sm text-forest-700 truncate">{value}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="p-1.5 rounded-lg hover:bg-white text-pista-700 shrink-0"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  blocked: "Blocked",
};

/** Customer-facing affiliate hub: shows a "become an affiliate" CTA if the
 * user hasn't registered yet, otherwise the full dashboard (links, clicks,
 * orders, commission). One page covers both registration and dashboard —
 * simpler than two separate routes for what is really one destination. */
export default function AffiliateDashboardPage() {
  const dispatch = useAppDispatch();
  const { profile, dashboard, orders, status } = useAppSelector((s) => s.affiliate);
  const products = useAppSelector((s) => s.products.items);

  useEffect(() => {
    dispatch(fetchMyAffiliateThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.status === "approved") {
      dispatch(fetchAffiliateDashboardThunk());
      dispatch(fetchAffiliateOrdersThunk());
      if (products.length === 0) dispatch(fetchProductsThunk({ page_size: 6 }));
    }
  }, [dispatch, profile?.status, products.length]);

  const origin = window.location.origin;

  async function handleRegister() {
    await dispatch(registerAffiliateThunk());
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Affiliate Program" }]} />
      <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mb-3 sm:mb-6">Affiliate Program</h1>

      {!profile && (
        <div className="rounded-3xl bg-white shadow-soft p-6 sm:p-10 text-center">
          <Megaphone className="w-10 h-10 text-pista-700 mx-auto mb-3" />
          <h2 className="font-display text-lg text-forest-700 mb-2">Earn commission promoting Prakruti Organics</h2>
          <p className="text-sm text-brown-500 max-w-md mx-auto mb-5">
            Get your own referral link, share it anywhere, and earn a commission on every order placed through it —
            once your application is approved.
          </p>
          <Button onClick={handleRegister} loading={status === "loading"}>Apply to Become an Affiliate</Button>
        </div>
      )}

      {profile && profile.status !== "approved" && (
        <div className="rounded-3xl bg-white shadow-soft p-6 sm:p-10 text-center">
          <p className="text-sm font-semibold text-forest-700 mb-1">Status: {STATUS_LABEL[profile.status]}</p>
          <p className="text-sm text-brown-500">
            {profile.status === "pending" && "Your application is awaiting admin approval. Check back soon."}
            {profile.status === "rejected" && "Your affiliate application was not approved."}
            {profile.status === "blocked" && "Your affiliate account has been blocked. Contact support for details."}
          </p>
        </div>
      )}

      {profile && profile.status === "approved" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-3xl bg-white shadow-soft p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-brown-500">Your Affiliate Code</p>
                <p className="font-display text-xl text-forest-700">{profile.affiliate_code}</p>
              </div>
              <p className="text-xs text-brown-500">Commission rate: <span className="font-semibold text-forest-700">{profile.commission_percentage}%</span></p>
            </div>
            <CopyRow label="Your affiliate link" value={`${origin}/?ref=${profile.affiliate_code}`} />
          </div>

          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <StatCard icon={<MousePointerClick className="w-5 h-5" />} label="Total Clicks" value={String(dashboard.total_clicks)} />
              <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Orders" value={String(dashboard.total_orders)} />
              <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Sales" value={formatCurrency(dashboard.total_sales)} />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Commission" value={formatCurrency(dashboard.commission_pending)} />
              <StatCard icon={<Wallet className="w-5 h-5" />} label="Earned Commission" value={formatCurrency(dashboard.commission_earned)} />
              <StatCard icon={<Wallet className="w-5 h-5" />} label="Paid Commission" value={formatCurrency(dashboard.commission_paid)} />
            </div>
          )}

          {products.length > 0 && (
            <div className="rounded-3xl bg-white shadow-soft p-4 sm:p-6">
              <h3 className="font-semibold text-forest-700 mb-3">Product Affiliate Links</h3>
              <div className="space-y-3">
                {products.slice(0, 6).map((p) => (
                  <CopyRow key={p.id} label={p.name} value={`${origin}/products/${p.slug}?ref=${profile.affiliate_code}`} />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white shadow-soft p-4 sm:p-6">
            <h3 className="font-semibold text-forest-700 mb-3">Order Attribution Summary</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-brown-500">No orders attributed to your link yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-beige text-left text-brown-500">
                      <th className="py-2 pr-4 font-medium">Order</th>
                      <th className="py-2 pr-4 font-medium">Order Status</th>
                      <th className="py-2 pr-4 font-medium">Total</th>
                      <th className="py-2 pr-4 font-medium">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.order_id} className="border-b border-beige/60 last:border-0">
                        <td className="py-2 pr-4 font-medium text-forest-700">{o.order_number}</td>
                        <td className="py-2 pr-4 text-brown-500 capitalize">{o.order_status.replace(/_/g, " ")}</td>
                        <td className="py-2 pr-4 text-brown-500">{formatCurrency(o.total_amount)}</td>
                        <td className="py-2 pr-4 text-brown-500">
                          {formatCurrency(o.commission_amount)}{" "}
                          <span className="text-[11px] capitalize">({o.commission_status})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
