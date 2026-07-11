import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters, { type FilterState } from "@/components/product/ProductFilters";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductsThunk } from "@/features/products/productsSlice";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductListParams } from "@/services/productService";

const SORT_OPTIONS = [
  { value: "popular", label: "Popularity" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const sortParam = searchParams.get("sort");
  const dispatch = useAppDispatch();

  const [sort, setSort] = useState(sortParam ?? "popular");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    maxPrice: 800,
    bestSellerOnly: false,
    newArrivalOnly: filterParam === "new-arrival",
  });
  const featuredOnly = filterParam === "featured";
  const debouncedFilters = useDebounce(filters, 300);

  const categories = useAppSelector((s) => s.products.categories);
  const { items, total, totalPages, listStatus, listError } = useAppSelector((s) => s.products);
  const loading = listStatus === "loading" || listStatus === "idle";

  const activeCategory = categories.find((c) => filters.categories.length === 1 && filters.categories[0] === c.slug);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, sort, featuredOnly]);

  useEffect(() => {
    const params: ProductListParams = {
      sort: sort as ProductListParams["sort"],
      page,
      page_size: 12,
      max_price: debouncedFilters.maxPrice,
    };
    if (debouncedFilters.categories.length > 0) params.category = debouncedFilters.categories.join(",");
    if (debouncedFilters.bestSellerOnly) params.best_seller = true;
    if (debouncedFilters.newArrivalOnly) params.new_arrival = true;
    if (featuredOnly) params.featured = true;
    dispatch(fetchProductsThunk(params));
  }, [dispatch, debouncedFilters, sort, page, featuredOnly]);

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
            <span className="text-sm text-brown-500">{total} product{total !== 1 ? "s" : ""}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm rounded-full border border-beige px-3 py-1.5 text-forest-700 outline-none"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {listError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {listError}
            </div>
          )}

          {loading ? <ProductGridSkeleton /> : <ProductGrid products={items} />}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-brown-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 text-sm font-semibold text-forest-700 border border-beige rounded-full px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:border-pista-500 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
