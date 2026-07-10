import type { DummyProduct } from "@/data/products";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/common/EmptyState";
import { SearchX } from "lucide-react";

interface ProductGridProps {
  products: DummyProduct[];
  columns?: 3 | 4;
}

/** Responsive grid wrapper for ProductCard collections, with an empty state. */
export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No products found"
        description="Try adjusting your filters or search for something else."
      />
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 md:gap-5`}>
      {products.map((p, i) => (
        <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
