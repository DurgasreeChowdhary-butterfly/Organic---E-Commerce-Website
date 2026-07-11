import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Plus, Check, CreditCard, Smartphone, Wallet, Landmark, ShoppingBag, AlertCircle, Tag, Loader2, X } from "lucide-react";
import clsx from "clsx";
import PriceSummary from "@/components/cart/PriceSummary";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import EmptyState from "@/components/common/EmptyState";
import AddressFormModal, { type AddressFormValues } from "@/components/checkout/AddressFormModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAddressThunk } from "@/features/addresses/addressesSlice";
import { fetchCartThunk } from "@/features/cart/cartSlice";
import { applyCouponThunk, removeCoupon, clearCouponError } from "@/features/coupon/couponSlice";
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment, reportPaymentFailure } from "@/services/paymentService";
import type { Address } from "@/types";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallets", icon: Wallet },
];

const ADDRESS_TYPE_LABEL: Record<Address["address_type"], string> = {
  home: "Home",
  office: "Office",
  other: "Other",
};

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 59;

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: cartItems, subtotal, discount: productDiscount, gst } = useAppSelector((s) => s.cart);
  const addresses = useAppSelector((s) => s.addresses.items);
  const user = useAppSelector((s) => s.auth.user);
  const coupon = useAppSelector((s) => s.coupon);

  const [selectedAddress, setSelectedAddress] = useState(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id);
  const [payment, setPayment] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");

  useEffect(() => {
    // Re-fetch right before checkout so stock/availability reflected in the
    // cart is as fresh as possible when we validate below.
    dispatch(fetchCartThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedAddress) {
      const fallback = addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id;
      if (fallback) setSelectedAddress(fallback);
    }
  }, [addresses, selectedAddress]);

  const orderValue = subtotal - productDiscount;
  const couponDiscount = coupon.discountAmount;
  const discount = productDiscount + couponDiscount;
  const shipping = orderValue - couponDiscount > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const stockIssues = cartItems.filter((item) => !item.product.is_active || item.quantity > item.product.stock_quantity);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add a few products before checking out." actionLabel="Browse Products" onAction={() => navigate("/products")} />
      </div>
    );
  }

  async function handleAddAddress(values: AddressFormValues) {
    setSavingAddress(true);
    const payload = { ...values, landmark: values.landmark?.trim() ? values.landmark.trim() : undefined };
    const result = await dispatch(createAddressThunk(payload));
    setSavingAddress(false);
    if (createAddressThunk.fulfilled.match(result)) {
      setShowAddressModal(false);
      const newDefault = result.payload.find((a) => a.is_default);
      if (newDefault) setSelectedAddress(newDefault.id);
    }
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    await dispatch(applyCouponThunk(couponInput.trim()));
  }

  function handleRemoveCoupon() {
    dispatch(removeCoupon());
    setCouponInput("");
  }

  async function placeOrder() {
    if (cartItems.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }
    const address = addresses.find((a) => a.id === selectedAddress);
    if (!address) {
      setCheckoutError("Please select a delivery address.");
      return;
    }
    if (stockIssues.length > 0) {
      setCheckoutError("Some items in your cart are no longer available in the requested quantity. Please update your cart before proceeding.");
      return;
    }
    setCheckoutError(null);
    setPlacing(true);

    let orderResponse;
    try {
      orderResponse = await createRazorpayOrder({ address_id: address.id, coupon_code: coupon.code ?? undefined });
    } catch (err) {
      setPlacing(false);
      setCheckoutError(apiErrorMessage(err, "Could not start payment. Please try again."));
      return;
    }

    let paymentResponse;
    try {
      paymentResponse = await openRazorpayCheckout({
        key: orderResponse.razorpay_key_id,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        order_id: orderResponse.razorpay_order_id,
        name: "Prakruti Organics",
        description: `Order for ${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`,
        prefill: { name: user?.full_name, email: user?.email, contact: user?.phone },
        theme: { color: "#1F3D2B" },
      });
    } catch (err) {
      setPlacing(false);
      if ((err as { cancelled?: boolean })?.cancelled) {
        await reportPaymentFailure(orderResponse.payment_id, "Cancelled by user").catch(() => undefined);
        setCheckoutError("Payment was cancelled. You can try again whenever you're ready.");
      } else {
        setCheckoutError("Could not open the payment gateway. Please try again.");
      }
      return;
    }

    try {
      const verifyResult = await verifyRazorpayPayment({
        payment_id: orderResponse.payment_id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      dispatch(removeCoupon());
      dispatch(fetchCartThunk()); // cart was already cleared server-side on verify success
      setPlacing(false);
      navigate(`/orders/${verifyResult.order_id}`);
    } catch (err) {
      setPlacing(false);
      setCheckoutError(
        apiErrorMessage(err, "Payment verification failed. If any amount was deducted, it will be refunded within 5-7 business days.")
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">Checkout</h1>

      {checkoutError && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{checkoutError}</span>
        </div>
      )}

      {stockIssues.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-soft-orange/10 text-soft-orange text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            {stockIssues.length === 1 ? "One item" : `${stockIssues.length} items`} in your cart {stockIssues.length === 1 ? "has" : "have"} limited or no stock available.
          </span>
          <button onClick={() => navigate("/cart")} className="text-xs font-semibold underline shrink-0">Review Cart</button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="min-w-0 md:col-span-2 space-y-6">
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
                      <span className="text-sm font-semibold text-forest-700">{addr.full_name} · {ADDRESS_TYPE_LABEL[addr.address_type]}</span>
                      {selectedAddress === addr.id && <Check className="w-4 h-4 text-pista-700 shrink-0" />}
                    </div>
                    <p className="text-xs text-brown-500 leading-relaxed mb-1">{addr.mobile_number}</p>
                    <p className="text-xs text-brown-500 leading-relaxed">
                      {addr.house_no}, {addr.street}{addr.landmark && `, ${addr.landmark}`}, {addr.city}, {addr.state} - {addr.pincode}
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
              {cartItems.map((item) => {
                const hasIssue = !item.product.is_active || item.quantity > item.product.stock_quantity;
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-forest-700">
                      {item.product.name} <span className="text-brown-500">× {item.quantity}</span>
                      {hasIssue && <span className="ml-2 text-[11px] font-semibold text-red-600">Unavailable</span>}
                    </span>
                    <span className="font-medium text-forest-700">₹{item.lineTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coupon */}
          <div className="rounded-3xl bg-white shadow-soft p-6">
            <label className="text-sm font-semibold text-forest-700 mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Have a coupon?</label>
            {coupon.code ? (
              <div className="flex items-center justify-between rounded-2xl bg-pista-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-pista-700 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> {coupon.code} applied</p>
                  <p className="text-xs text-brown-500 mt-0.5">{coupon.message}</p>
                </div>
                <button onClick={handleRemoveCoupon} className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 shrink-0">
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); if (coupon.error) dispatch(clearCouponError()); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  placeholder="Enter coupon code"
                  className="flex-1 min-w-0 rounded-full border border-beige px-4 py-2.5 text-sm outline-none focus:border-pista-500 uppercase placeholder:normal-case"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={coupon.status === "loading" || !couponInput.trim()}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold bg-forest-700 text-white shrink-0 hover:bg-forest-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {coupon.status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}
            {coupon.error && <p className="text-xs text-red-600 mt-2">{coupon.error}</p>}
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
            <p className="text-[11px] text-brown-500 mt-3">Payments are processed securely via Razorpay.</p>
          </div>
        </div>

        <div>
          <PriceSummary
            subtotal={subtotal}
            discount={discount}
            gst={gst}
            shipping={shipping}
            ctaLabel="Place Order"
            onCta={placeOrder}
            ctaLoading={placing}
          />
        </div>
      </div>

      <AddressFormModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
        submitting={savingAddress}
      />
    </div>
  );
}
