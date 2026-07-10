import { useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, ShoppingCart, Check, Truck, ShieldCheck, RefreshCw, Star } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import PriceTag from "@/components/common/PriceTag";
import StarRating from "@/components/common/StarRating";
import Badge from "@/components/common/Badge";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import QuantityStepper from "@/components/common/QuantityStepper";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import { getProductBySlug, getRelatedProducts, CATEGORIES } from "@/data/products";
import { SearchX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { toggleWishlist } from "@/features/wishlist/wishlistSlice";
import Skeleton from "@/components/common/Skeleton";
import { useLoading } from "@/hooks/useLoading";

const DUMMY_REVIEWS = [
  { name: "Meera K.", rating: 5, text: "Excellent quality, exactly as described. Will reorder." },
  { name: "Arjun P.", rating: 4, text: "Good product, packaging could be a touch sturdier." },
  { name: "Sneha T.", rating: 5, text: "Tastes so much better than store-bought. Worth the price." },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector((s) => (product ? s.wishlist.items.some((i) => i.product.id === product.id) : false));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<"description" | "specs" | "reviews">("description");
  const loading = useLoading(300);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState icon={SearchX} title="Product not found" description="This product may have been removed or the link is incorrect." actionLabel="Back to Shop" onAction={() => window.history.back()} />
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);
  const related = getRelatedProducts(product);
  const outOfStock = product.stock_quantity === 0;

  function handleAddToCart() {
    if (outOfStock) return;
    dispatch(addToCart({ product: product!, quantity }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleToggleWishlist() {
    dispatch(toggleWishlist(product!));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: category?.name ?? "Shop", to: `/products?category=${product.categorySlug}` },
        { label: product.name },
      ]} />

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div className="animate-fade-up"><ProductGallery tint={product.tint} name={product.name} /></div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex gap-2 mb-3">
            {product.isBestSeller && <Badge tone="gold">Best Seller</Badge>}
            {product.isNewArrival && <Badge tone="orange">New</Badge>}
          </div>
          <h1 className="font-display text-3xl text-forest-700 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            <span className="text-xs text-brown-500">· {product.weight}</span>
          </div>
          <PriceTag price={product.price} discountPrice={product.discount_price} size="lg" />
          <p className="text-sm text-brown-500 mt-4 leading-relaxed max-w-md">{product.description}</p>

          <div className="mt-3">
            {outOfStock ? (
              <span className="text-sm font-semibold text-red-600">Out of stock</span>
            ) : product.stock_quantity < 10 ? (
              <span className="text-sm font-semibold text-soft-orange">Only {product.stock_quantity} left in stock</span>
            ) : (
              <span className="text-sm font-semibold text-pista-700">In stock</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <QuantityStepper quantity={quantity} onChange={setQuantity} max={product.stock_quantity || 1} />
            <Button
              size="lg" disabled={outOfStock} onClick={handleAddToCart}
              icon={added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              className="flex-1"
            >
              {added ? "Added to Cart" : "Add to Cart"}
            </Button>
            <button
              onClick={handleToggleWishlist}
              className="w-12 h-12 rounded-full border-2 border-beige flex items-center justify-center shrink-0 hover:border-soft-orange transition-colors"
              aria-label="Toggle wishlist"
            >
              <Heart className={wishlisted ? "w-5 h-5 fill-soft-orange text-soft-orange" : "w-5 h-5 text-forest-700"} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-beige">
            <div className="flex flex-col items-center text-center gap-1.5">
              <Truck className="w-5 h-5 text-pista-700" />
              <span className="text-[11px] text-brown-500">Free shipping ₹499+</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-pista-700" />
              <span className="text-[11px] text-brown-500">100% Organic Certified</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5">
              <RefreshCw className="w-5 h-5 text-pista-700" />
              <span className="text-[11px] text-brown-500">7-day easy returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Tabs: Description / Specs / Reviews ---------- */}
      <div className="mb-14">
        <div className="flex gap-6 border-b border-beige mb-6">
          {(["description", "specs", "reviews"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-colors ${tab === t ? "border-forest-700 text-forest-700" : "border-transparent text-brown-500"}`}
            >
              {t === "specs" ? "Specifications" : t}
            </button>
          ))}
        </div>

        {tab === "description" && (
          <p className="text-sm text-brown-500 leading-relaxed max-w-2xl animate-fade-up">{product.description}</p>
        )}

        {tab === "specs" && (
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl animate-fade-up">
            {product.specifications.map((s) => (
              <div key={s.label} className="flex justify-between text-sm border-b border-beige py-2">
                <span className="text-brown-500">{s.label}</span>
                <span className="text-forest-700 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-4 max-w-2xl animate-fade-up">
            {DUMMY_REVIEWS.map((r, i) => (
              <div key={i} className="rounded-2xl bg-white shadow-soft p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-forest-700">{r.name}</span>
                  <div className="flex">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />)}</div>
                </div>
                <p className="text-sm text-brown-500">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Related Products ---------- */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl text-forest-700 mb-6">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
