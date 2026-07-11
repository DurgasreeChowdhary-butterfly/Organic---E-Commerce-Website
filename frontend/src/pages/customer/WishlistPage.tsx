import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Leaf, Loader2, AlertCircle } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import EmptyState from "@/components/common/EmptyState";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import Skeleton from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlistThunk, moveToCartThunk, clearWishlistError } from "@/features/wishlist/wishlistSlice";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

export default function WishlistPage() {
  const { items, status, error, mutatingProductId } = useAppSelector((s) => s.wishlist);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const loading = status === "idle" || status === "loading";

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

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 text-red-700 text-sm px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => dispatch(clearWishlistError())} className="text-xs font-semibold underline shrink-0">Dismiss</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const busy = mutatingProductId === item.product.id;
          const outOfStock = item.product.stock_quantity === 0;
          const primaryImage = item.product.images?.find((img) => img.is_primary) ?? item.product.images?.[0];
          const imageUrl = resolveImageUrl(primaryImage?.image_url);

          return (
            <div key={item.id} className="rounded-3xl bg-white shadow-soft p-4 flex gap-4 animate-fade-up">
              <Link
                to={`/products/${item.product.slug}`}
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${item.product.tint}14 0%, ${item.product.tint}2A 100%)` }}
              >
                {imageUrl && !failedImages.has(item.product.id) ? (
                  <img
                    src={imageUrl}
                    alt={item.product.name}
                    onError={() => setFailedImages((prev) => new Set(prev).add(item.product.id))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Leaf className="w-7 h-7 opacity-40" style={{ color: item.product.tint }} />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="font-medium text-sm text-forest-700 line-clamp-2 hover:text-pista-700">{item.product.name}</Link>
                <div className="mt-1"><PriceTag price={item.product.price} discountPrice={item.product.discount_price} size="sm" /></div>
                {outOfStock && <p className="text-[11px] font-semibold text-red-600 mt-1">Out of stock</p>}
                <div className="flex items-center gap-3 mt-2.5">
                  <button
                    onClick={() => dispatch(moveToCartThunk(item.product.id))}
                    disabled={busy || outOfStock}
                    className="text-xs font-semibold flex items-center gap-1 text-forest-700 hover:text-pista-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingCart className="w-3.5 h-3.5" />} Move to Cart
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlistThunk(item.product.id))}
                    disabled={busy}
                    className="text-xs text-brown-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50"
                  >
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
