import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Leaf } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Skeleton from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlist } from "@/features/wishlist/wishlistSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { useLoading } from "@/hooks/useLoading";

export default function WishlistPage() {
  const items = useAppSelector((s) => s.wishlist.items);
  const dispatch = useAppDispatch();
  const [movedIds, setMovedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const loading = useLoading(350);

  function moveToCart(id: string, product: (typeof items)[number]["product"]) {
    dispatch(addToCart({ product, quantity: 1 }));
    setMovedIds((prev) => [...prev, id]);
    setTimeout(() => dispatch(removeFromWishlist(id)), 900);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl bg-white shadow-soft p-4 flex gap-4">
              <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save products you love here so you can find them easily later." actionLabel="Explore Products" onAction={() => navigate("/products")} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Wishlist" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-6">My Wishlist ({items.length})</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const moved = movedIds.includes(item.id);
          return (
            <div key={item.id} className="rounded-3xl bg-white shadow-soft p-4 flex gap-4 animate-fade-up">
              <Link
                to={`/products/${item.product.slug}`}
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${item.product.tint}14 0%, ${item.product.tint}2A 100%)` }}
              >
                <Leaf className="w-7 h-7 opacity-40" style={{ color: item.product.tint }} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-medium text-sm text-forest-700 line-clamp-2 hover:text-pista-700">{item.product.name}</Link>
                <div className="mt-1"><PriceTag price={item.product.price} discountPrice={item.product.discount_price} size="sm" /></div>
                <div className="flex items-center gap-3 mt-2.5">
                  <button
                    onClick={() => moveToCart(item.id, item.product)}
                    disabled={moved}
                    className={`text-xs font-semibold flex items-center gap-1 ${moved ? "text-pista-700" : "text-forest-700 hover:text-pista-700"}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> {moved ? "Moved!" : "Move to Cart"}
                  </button>
                  <button onClick={() => dispatch(removeFromWishlist(item.id))} className="text-xs text-brown-500 hover:text-red-600 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
