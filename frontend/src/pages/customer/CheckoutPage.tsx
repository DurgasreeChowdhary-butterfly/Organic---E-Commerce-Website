import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Check, CreditCard, Smartphone, Wallet, Landmark } from "lucide-react";
import clsx from "clsx";
import PriceSummary from "@/components/cart/PriceSummary";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { ADDRESSES } from "@/data/orders";
import { CART_ITEMS } from "@/data/misc";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets", icon: Wallet },
];

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES.find((a) => a.is_default)?.id ?? ADDRESSES[0]?.id);
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const subtotal = CART_ITEMS.reduce((sum, i) => sum + (i.product.discount_price ?? i.product.price) * i.quantity, 0);
  const gst = Math.round(subtotal * 0.05);

  function placeOrder() {
    setPlacing(true);
    setTimeout(() => navigate("/orders"), 1200);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Address */}
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-forest-700 flex items-center gap-2"><MapPin className="w-4.5 h-4.5" /> Delivery Address</h2>
              <button className="text-xs font-semibold text-pista-700 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add New</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {ADDRESSES.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={clsx(
                    "text-left rounded-2xl border-2 p-4 transition-colors",
                    selectedAddress === addr.id ? "border-pista-700 bg-pista-50" : "border-beige hover:border-pista-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-forest-700">{addr.label}</span>
                    {selectedAddress === addr.id && <Check className="w-4 h-4 text-pista-700" />}
                  </div>
                  <p className="text-xs text-brown-500 leading-relaxed">
                    {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-4">Order Items ({CART_ITEMS.length})</h2>
            <div className="space-y-3">
              {CART_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-forest-700">{item.product.name} <span className="text-brown-500">× {item.quantity}</span></span>
                  <span className="font-medium text-forest-700">₹{(item.product.discount_price ?? item.product.price) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayment(m.id)}
                    className={clsx(
                      "flex items-center gap-3 rounded-2xl border-2 p-4 transition-colors",
                      payment === m.id ? "border-pista-700 bg-pista-50" : "border-beige hover:border-pista-300"
                    )}
                  >
                    <Icon className="w-5 h-5 text-forest-700" />
                    <span className="text-sm font-medium text-forest-700">{m.label}</span>
                    {payment === m.id && <Check className="w-4 h-4 text-pista-700 ml-auto" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-brown-500 mt-3">Payments are processed securely via Razorpay. (Demo — no real charge is made.)</p>
          </div>
        </div>

        <div>
          <PriceSummary subtotal={subtotal} gst={gst} shipping={subtotal > 499 ? 0 : 59} ctaLabel="Place Order" onCta={placeOrder} ctaLoading={placing} />
        </div>
      </div>
    </div>
  );
}
