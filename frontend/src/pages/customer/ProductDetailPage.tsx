import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Check, Truck, ShieldCheck, RefreshCw, SearchX, Loader2 } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import PriceTag from "@/components/common/PriceTag";
import StarRating from "@/components/common/StarRating";
import Badge from "@/components/common/Badge";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import QuantityStepper from "@/components/common/QuantityStepper";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartThunk } from "@/features/cart/cartSlice";
import { toggleWishlistThunk } from "@/features/wishlist/wishlistSlice";
import { fetchProductBySlugThunk } from "@/features/products/productsSlice";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { currentProduct: product, relatedProducts: related, detailStatus } = useAppSelector((s) => s.products);
  const wishlisted = useAppSelector((s) => (product ? s.wishlist.items.some((i) => i.product.id === product.id) : false));
  const wishlistBusy = useAppSelector((s) => (product ? s.wishlist.mutatingProductId === product.id : false));
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [tab, setTab] = useState<"description" | "specs">("description");

  useEffect(() => {
    if (slug) dispatch(fetchProductBySlugThunk(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  const loading = detailStatus === "loading" || detailStatus === "idle";

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

  const outOfStock = product.stock_quantity === 0;

  async function handleAddToCart() {
    if (outOfStock || addingToCart) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    const result = await dispatch(addToCartThunk({ productId: product!.id, quantity }));
    setAddingToCart(false);
    if (addToCartThunk.fulfilled.match(result)) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  function handleToggleWishlist() {
    if (wishlistBusy) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(toggleWishlistThunk(product!));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: product.category.name, to: `/products?category=${product.categorySlug}` },
        { label: product.name },
      ]} />

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        <div className="animate-fade-up"><ProductGallery tint={product.tint} name={product.name} images={product.images} /></div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="flex gap-2 mb-3">
            {product.isBestSeller && <Badge tone="gold">Best Seller</Badge>}
            {product.isNewArrival && <Badge tone="orange">New</Badge>}
            {product.is_featured && <Badge tone="outline">Featured</Badge>}
          </div>
          <h1 className="font-display text-3xl text-forest-700 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            {product.reviewCount > 0 && <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />}
            <span className="text-xs text-brown-500">SKU: {product.sku} · {product.weight}</span>
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
              size="lg" disabled={outOfStock || addingToCart} onClick={handleAddToCart}
              icon={addingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              className="flex-1"
            >
              {added ? "Added to Cart" : "Add to Cart"}
            </Button>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistBusy}
              className="w-12 h-12 rounded-full border-2 border-beige flex items-center justify-center shrink-0 hover:border-soft-orange transition-colors"
              aria-label="Toggle wishlist"
            >
              {wishlistBusy ? (
                <Loader2 className="w-5 h-5 animate-spin text-forest-700" />
              ) : (
                <Heart className={wishlisted ? "w-5 h-5 fill-soft-orange text-soft-orange" : "w-5 h-5 text-forest-700"} />
              )}
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

      {/* ---------- Tabs: Description / Specs ---------- */}
      <div className="mb-14">
        <div className="flex gap-6 border-b border-beige mb-6">
          {(["description", "specs"] as const).map((t) => (
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
          product.specifications.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl animate-fade-up">
              {product.specifications.map((s) => (
                <div key={s.label} className="flex justify-between text-sm border-b border-beige py-2">
                  <span className="text-brown-500">{s.label}</span>
                  <span className="text-forest-700 font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-brown-500 max-w-2xl animate-fade-up">No specifications listed for this product yet.</p>
          )
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
