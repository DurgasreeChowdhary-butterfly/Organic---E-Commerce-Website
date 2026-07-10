import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Tag, Check } from "lucide-react";
import CartItemRow from "@/components/cart/CartItemRow";
import PriceSummary from "@/components/cart/PriceSummary";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Skeleton from "@/components/common/Skeleton";
import { COUPONS } from "@/data/misc";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateQuantity, removeFromCart } from "@/features/cart/cartSlice";
import { useLoading } from "@/hooks/useLoading";

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<typeof COUPONS[number] | null>(null);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();
  const loading = useLoading(350);

  const subtotal = items.reduce((sum, i) => sum + (i.product.discount_price ?? i.product.price) * i.quantity, 0);

  function applyCoupon() {
    const match = COUPONS.find((c) => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    if (!match) {
      setCouponError("Invalid or expired coupon code.");
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < match.minOrder) {
      setCouponError(`This coupon needs a minimum order of ₹${match.minOrder}.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(match);
    setCouponError("");
  }

  const discount = appliedCoupon
    ? appliedCoupon.type === "flat" ? appliedCoupon.value : Math.round((subtotal * appliedCoupon.value) / 100)
    : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 rounded-3xl bg-white shadow-soft p-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Looks like you haven't added anything yet. Explore our organic collection to get started." actionLabel="Start Shopping" onAction={() => navigate("/products")} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Cart" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">Shopping Cart ({items.length})</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="rounded-3xl bg-white shadow-soft p-6">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                id={item.id}
                product={item.product}
                quantity={item.quantity}
                onQuantityChange={(id, quantity) => dispatch(updateQuantity({ id, quantity }))}
                onRemove={(id) => dispatch(removeFromCart(id))}
              />
            ))}
          </div>

          <div className="rounded-3xl bg-white shadow-soft p-6 mt-4">
            <label className="text-sm font-semibold text-forest-700 mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Have a coupon?</label>
            <div className="flex gap-2">
              <input
                value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code" className="flex-1 rounded-full border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500"
              />
              <button onClick={applyCoupon} className="rounded-full px-5 py-2.5 text-sm font-semibold bg-forest-700 text-white shrink-0 hover:bg-forest-500 transition-colors">Apply</button>
            </div>
            {couponError && <p className="text-xs text-red-600 mt-2">{couponError}</p>}
            {appliedCoupon && <p className="text-xs text-pista-700 mt-2 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> "{appliedCoupon.code}" applied — {appliedCoupon.label}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {COUPONS.map((c) => (
                <button key={c.code} onClick={() => setCouponInput(c.code)} className="text-[11px] font-semibold rounded-full px-3 py-1 bg-pista-50 text-pista-700 hover:bg-pista-100 transition-colors">
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          <Link to="/products" className="inline-block mt-4 text-sm font-semibold text-forest-700 hover:text-pista-700">← Continue Shopping</Link>
        </div>

        <div>
          <PriceSummary
            subtotal={subtotal}
            discount={discount}
            ctaLabel="Proceed to Checkout"
            onCta={() => navigate("/checkout")}
          />
        </div>
      </div>
    </div>
  );
}
