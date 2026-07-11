import { Link, useNavigate } from "react-router-dom";
import { Heart, Leaf, ShoppingCart, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import type { DummyProduct } from "@/data/products";
import PriceTag from "@/components/common/PriceTag";
import Badge from "@/components/common/Badge";
import StarRating from "@/components/common/StarRating";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartThunk } from "@/features/cart/cartSlice";
import { toggleWishlistThunk } from "@/features/wishlist/wishlistSlice";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

interface ProductCardProps {
  product: DummyProduct;
}

/** Grid card used in listings, featured sections, related products. */
export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wishlisted = useAppSelector((s) => s.wishlist.items.some((i) => i.product.id === product.id));
  const wishlistBusy = useAppSelector((s) => s.wishlist.mutatingProductId === product.id);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const outOfStock = product.stock_quantity === 0;
  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const imageUrl = resolveImageUrl(primaryImage?.image_url);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock || addingToCart) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    const result = await dispatch(addToCartThunk({ productId: product.id, quantity: 1 }));
    setAddingToCart(false);
    if (addToCartThunk.fulfilled.match(result)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (wishlistBusy) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleWishlistThunk(product));
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block rounded-3xl bg-white p-4 shadow-soft hover:shadow-glass transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="relative aspect-square rounded-2xl mb-3 overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${product.tint}14 0%, ${product.tint}2A 100%)` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Leaf
            className="w-10 h-10 opacity-40 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
            style={{ color: product.tint }}
          />
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestSeller && <Badge tone="gold">Best Seller</Badge>}
          {product.isNewArrival && <Badge tone="orange">New</Badge>}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-forest-700/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold uppercase tracking-wide">Out of Stock</span>
          </div>
        )}

        <button
          onClick={handleToggleWishlist}
          disabled={wishlistBusy}
          className={clsx(
            "absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-opacity",
            wishlisted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          aria-label="Toggle wishlist"
        >
          {wishlistBusy ? (
            <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
          ) : (
            <Heart className={clsx("w-4 h-4 transition-colors", wishlisted ? "fill-soft-orange text-soft-orange" : "text-forest-700")} />
          )}
        </button>
      </div>

      <p className="text-[11px] uppercase tracking-wide text-brown-500 mb-1">{product.weight}</p>
      <h3 className="text-sm font-medium leading-snug text-forest-700 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
      {product.reviewCount > 0 && <div className="mt-1"><StarRating rating={product.rating} reviewCount={product.reviewCount} /></div>}
      <div className="mt-2"><PriceTag price={product.price} discountPrice={product.discount_price} /></div>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock || addingToCart}
        className={clsx(
          "mt-3 w-full text-xs font-semibold py-2.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center gap-1.5",
          outOfStock && "border-beige text-brown-500/50 cursor-not-allowed",
          !outOfStock && added && "bg-pista-700 border-pista-700 text-white",
          !outOfStock && !added && "border-pista-500 text-forest-700 hover:bg-pista-700 hover:border-pista-700 hover:text-white"
        )}
      >
        {addingToCart ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : added ? (
          <><Check className="w-3.5 h-3.5" /> Added</>
        ) : (
          <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
        )}
      </button>
    </Link>
  );
}
