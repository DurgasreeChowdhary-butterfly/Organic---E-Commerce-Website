import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PRODUCTS } from "@/data/products";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

/** Smart search input with a live dummy-data suggestions dropdown. */
export default function SearchBar({ onClose, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 200);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const suggestions = debounced.length > 0
    ? PRODUCTS.filter((p) => p.name.toLowerCase().includes(debounced.toLowerCase())).slice(0, 5)
    : [];

  function goToSearch() {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-pista-50 border border-transparent focus-within:border-pista-500 transition-colors">
        <Search className="w-4 h-4 text-pista-700 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToSearch()}
          placeholder="Search organic foods, spices, oils..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-brown-500/70 text-forest-700"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search">
            <X className="w-4 h-4 text-brown-500" />
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-glass overflow-hidden z-50 animate-scale-in">
          {suggestions.map((p) => (
            <button
              key={p.id}
              onClick={() => { navigate(`/products/${p.slug}`); onClose?.(); }}
              className="w-full text-left px-4 py-3 hover:bg-pista-50 flex items-center justify-between text-sm text-forest-700 transition-colors"
            >
              <span>{p.name}</span>
              <span className="text-xs text-brown-500 capitalize">{p.categorySlug.replace("-", " ")}</span>
            </button>
          ))}
          <button
            onClick={goToSearch}
            className="w-full text-left px-4 py-3 bg-pista-50 text-xs font-semibold text-forest-700 hover:bg-pista-100"
          >
            See all results for "{query}" →
          </button>
        </div>
      )}
    </div>
  );
}
