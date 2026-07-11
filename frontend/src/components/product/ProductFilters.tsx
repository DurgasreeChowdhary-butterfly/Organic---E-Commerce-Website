import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useAppSelector } from "@/store/hooks";

export interface FilterState {
  categories: string[];
  maxPrice: number;
  bestSellerOnly: boolean;
  newArrivalOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-beige py-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-sm font-semibold text-forest-700 mb-3">
        {title}
        <ChevronDown className={clsx("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && children}
    </div>
  );
}

/** Sidebar/drawer filters for the product listing page. Fully interactive against dummy data. */
export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const categories = useAppSelector((s) => s.products.categories);

  function toggleCategory(slug: string) {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    onChange({ ...filters, categories: next });
  }

  return (
    <aside className="w-full md:w-64 shrink-0">
      <FilterSection title="Category">
        <div className="space-y-2.5">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 text-sm text-brown-500 cursor-pointer hover:text-forest-700">
              <input
                type="checkbox"
                checked={filters.categories.includes(c.slug)}
                onChange={() => toggleCategory(c.slug)}
                className="w-4 h-4 rounded accent-pista-700"
              />
              {c.name}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <input
          type="range"
          min={100}
          max={800}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-pista-700"
        />
        <div className="flex justify-between text-xs text-brown-500 mt-1">
          <span>₹100</span>
          <span className="font-semibold text-forest-700">Up to ₹{filters.maxPrice}</span>
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-brown-500 cursor-pointer hover:text-forest-700">
            <input
              type="checkbox"
              checked={filters.bestSellerOnly}
              onChange={(e) => onChange({ ...filters, bestSellerOnly: e.target.checked })}
              className="w-4 h-4 rounded accent-pista-700"
            />
            Best Sellers
          </label>
          <label className="flex items-center gap-2.5 text-sm text-brown-500 cursor-pointer hover:text-forest-700">
            <input
              type="checkbox"
              checked={filters.newArrivalOnly}
              onChange={(e) => onChange({ ...filters, newArrivalOnly: e.target.checked })}
              className="w-4 h-4 rounded accent-pista-700"
            />
            New Arrivals
          </label>
        </div>
      </FilterSection>

      <button
        onClick={() => onChange({ categories: [], maxPrice: 800, bestSellerOnly: false, newArrivalOnly: false })}
        className="mt-4 text-xs font-semibold text-soft-orange hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
}
