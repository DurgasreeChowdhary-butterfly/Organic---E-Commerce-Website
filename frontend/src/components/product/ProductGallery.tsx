import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import clsx from "clsx";
import type { ProductImage } from "@/types";
import { resolveImageUrl } from "@/utils/resolveImageUrl";

interface ProductGalleryProps {
  tint: string;
  name: string;
  images?: ProductImage[];
}

/**
 * Product detail image gallery. Renders real uploaded product photos when
 * available; falls back to a tinted placeholder panel for products that
 * don't have any yet.
 */
export default function ProductGallery({ tint, name, images = [] }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [images]);

  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
  const activeUrl = resolveImageUrl(sorted[active]?.image_url);

  return (
    <div>
      <div
        className="aspect-square rounded-3xl flex items-center justify-center mb-3 transition-colors duration-300 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tint}14 0%, ${tint}30 100%)` }}
      >
        {activeUrl ? (
          <img src={activeUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Leaf className="w-20 h-20 opacity-40" style={{ color: tint }} />
        )}
      </div>
      {sorted.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={clsx(
                "aspect-square rounded-xl2 flex items-center justify-center border-2 transition-colors overflow-hidden",
                active === i ? "border-pista-700" : "border-transparent"
              )}
              style={{ background: `linear-gradient(135deg, ${tint}10 0%, ${tint}24 100%)` }}
              aria-label={`${name} thumbnail ${i + 1}`}
            >
              <img src={resolveImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
