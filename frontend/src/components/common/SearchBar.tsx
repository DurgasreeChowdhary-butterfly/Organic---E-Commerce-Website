import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as productService from "@/services/productService";
import type { DummyProduct } from "@/data/products";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

/** Smart search input with a live suggestions dropdown backed by the real search API. */
export default function SearchBar({ onClose, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DummyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 250);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (debounced.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    productService
      .searchProducts(debounced.trim(), 1, 5)
      .then((res) => {
        if (!cancelled) setSuggestions(res.items);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

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
        {loading && <Loader2 className="w-4 h-4 text-brown-500 animate-spin shrink-0" />}
        {query && !loading && (
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
              <span className="text-xs text-brown-500 capitalize">{p.category.name}</span>
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
