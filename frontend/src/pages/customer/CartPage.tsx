import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, AlertCircle } from "lucide-react";
import CartItemRow from "@/components/cart/CartItemRow";
import PriceSummary from "@/components/cart/PriceSummary";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Skeleton from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCartItemThunk, removeCartItemThunk, clearCartError } from "@/features/cart/cartSlice";

export default function CartPage() {
  const { items, subtotal, discount, gst, status, error, mutatingId } = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = status === "idle" || status === "loading";

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

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => dispatch(clearCartError())} className="text-xs font-semibold underline shrink-0">Dismiss</button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="rounded-3xl bg-white shadow-soft p-6">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                id={item.id}
                product={item.product}
                quantity={item.quantity}
                busy={mutatingId === item.id}
                onQuantityChange={(id, quantity) => dispatch(updateCartItemThunk({ itemId: id, quantity }))}
                onRemove={(id) => dispatch(removeCartItemThunk(id))}
              />
            ))}
          </div>

          <Link to="/products" className="inline-block mt-4 text-sm font-semibold text-forest-700 hover:text-pista-700">← Continue Shopping</Link>
        </div>

        <div>
          <PriceSummary
            subtotal={subtotal}
            discount={discount}
            gst={gst}
            ctaLabel="Proceed to Checkout"
            onCta={() => navigate("/checkout")}
          />
        </div>
      </div>
    </div>
  );
}
