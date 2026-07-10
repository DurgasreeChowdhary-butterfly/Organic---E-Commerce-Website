import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { PRODUCTS } from "@/data/products";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const results = useMemo(
    () => PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Search" }]} />
      <h1 className="font-display text-2xl md:text-3xl text-forest-700 mb-1">
        Results for "{query}"
      </h1>
      <p className="text-sm text-brown-500 mb-6">{results.length} product{results.length !== 1 ? "s" : ""} found</p>
      <ProductGrid products={results} />
    </div>
  );
}
