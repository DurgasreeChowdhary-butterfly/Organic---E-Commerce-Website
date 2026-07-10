import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters, { type FilterState } from "@/components/product/ProductFilters";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { useLoading } from "@/hooks/useLoading";

const SORT_OPTIONS = [
  { value: "popular", label: "Popularity" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
];

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const [sort, setSort] = useState("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    maxPrice: 800,
    bestSellerOnly: filterParam === "best-seller",
    newArrivalOnly: filterParam === "new-arrival",
  });
  const loading = useLoading(300);

  const activeCategory = CATEGORIES.find((c) => filters.categories.length === 1 && filters.categories[0] === c.slug);

  const filtered = useMemo(() => {
    let result = PRODUCTS.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.categorySlug)) return false;
      if ((p.discount_price ?? p.price) > filters.maxPrice) return false;
      if (filters.bestSellerOnly && !p.isBestSeller) return false;
      if (filters.newArrivalOnly && !p.isNewArrival) return false;
      return true;
    });

    if (sort === "price_low") result = [...result].sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    if (sort === "price_high") result = [...result].sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [filters, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: activeCategory ? activeCategory.name : "Shop All" }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-forest-700">
          {activeCategory ? activeCategory.name : "Shop All Products"}
        </h1>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        <div className="hidden md:block">
          <ProductFilters filters={filters} onChange={setFilters} />
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-forest-900/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream p-5 overflow-y-auto animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-forest-700">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X className="w-5 h-5 text-forest-700" /></button>
              </div>
              <ProductFilters filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-brown-500">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm rounded-full border border-beige px-3 py-1.5 text-forest-700 outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {loading ? <ProductGridSkeleton /> : <ProductGrid products={filtered} />}
        </div>
      </div>
    </div>
  );
}
