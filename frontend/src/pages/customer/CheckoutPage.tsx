import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plus, Check, CreditCard, Smartphone, Wallet, Landmark, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import PriceSummary from "@/components/cart/PriceSummary";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import AddressFormModal, { type AddressFormValues } from "@/components/checkout/AddressFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addAddress } from "@/features/addresses/addressesSlice";
import { createOrder } from "@/features/orders/ordersSlice";
import { clearCartThunk } from "@/features/cart/cartSlice";
import { buildTimeline, type DummyOrder } from "@/data/orders";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets", icon: Wallet },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const addresses = useAppSelector((s) => s.addresses.items);

  const [selectedAddress, setSelectedAddress] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id);
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product.discount_price ?? i.product.price) * i.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const shipping = subtotal > 499 ? 0 : 59;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add a few products before checking out." actionLabel="Browse Products" onAction={() => navigate("/products")} />
      </div>
    );
  }

  function handleAddAddress(values: AddressFormValues) {
    dispatch(addAddress(values));
    setShowAddressModal(false);
  }

  function placeOrder() {
    const address = addresses.find((a) => a.id === selectedAddress);
    if (!address) return;
    setPlacing(true);
    setTimeout(() => {
      const id = `o_${Date.now()}`;
      const order: DummyOrder = {
        id,
        order_number: `PRK-${100000 + Math.floor(Math.random() * 899999)}`,
        status: "confirmed",
        total_amount: subtotal + gst + shipping,
        created_at: new Date().toISOString(),
        items: cartItems.map((i) => ({ product: i.product, quantity: i.quantity })),
        address,
        subtotal,
        gst,
        shipping,
        discount: 0,
        timeline: buildTimeline("confirmed"),
      };
      dispatch(createOrder(order));
      dispatch(clearCartThunk());
      setPlacing(false);
      navigate(`/orders/${id}`);
    }, 1200);
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
              <button onClick={() => setShowAddressModal(true)} className="text-xs font-semibold text-pista-700 flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-sm text-brown-500">No saved addresses. Add one to continue.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
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
            )}
          </div>

          {/* Items */}
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <h2 className="font-semibold text-forest-700 mb-4">Order Items ({cartItems.length})</h2>
            <div className="space-y-3">
              {cartItems.map((item) => (
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
          <PriceSummary
            subtotal={subtotal}
            gst={gst}
            shipping={shipping}
            ctaLabel="Place Order"
            onCta={placeOrder}
            ctaLoading={placing}
          />
        </div>
      </div>

      <AddressFormModal open={showAddressModal} onClose={() => setShowAddressModal(false)} onSubmit={handleAddAddress} />
    </div>
  );
}
