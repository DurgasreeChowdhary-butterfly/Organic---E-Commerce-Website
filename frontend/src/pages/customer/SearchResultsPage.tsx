import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { searchProductsThunk } from "@/features/products/productsSlice";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);
  const dispatch = useAppDispatch();
  const { searchResults, searchTotal, searchStatus } = useAppSelector((s) => s.products);
  const loading = searchStatus === "loading";
  const totalPages = Math.max(Math.ceil(searchTotal / 20), 1);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (query.trim()) dispatch(searchProductsThunk({ q: query.trim(), page }));
  }, [dispatch, query, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Search" }]} />
      <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mb-0.5 sm:mb-1">
        Results for "{query}"
      </h1>
      <p className="text-xs sm:text-sm text-brown-500 mb-3 sm:mb-6">{loading ? "Searching…" : `${searchTotal} product${searchTotal !== 1 ? "s" : ""} found`}</p>
      {loading ? <ProductGridSkeleton /> : <ProductGrid products={searchResults} />}

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
  );
}
