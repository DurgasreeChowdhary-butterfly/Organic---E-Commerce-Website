import { useState } from "react";
import { Leaf } from "lucide-react";
import clsx from "clsx";

interface ProductGalleryProps {
  tint: string;
  name: string;
}

/**
 * Product detail image gallery. Uses tinted placeholder panels since no
 * real product photography exists yet — swap for <img> once images/CDN
 * URLs are available from the backend.
 */
export default function ProductGallery({ tint, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const shots = [0, 1, 2, 3];

  return (
    <div>
      <div
        className="aspect-square rounded-3xl flex items-center justify-center mb-3 transition-colors duration-300"
        style={{ background: `linear-gradient(135deg, ${tint}14 0%, ${tint}30 100%)` }}
      >
        <Leaf className="w-20 h-20 opacity-40" style={{ color: tint }} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {shots.map((i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={clsx(
              "aspect-square rounded-xl2 flex items-center justify-center border-2 transition-colors",
              active === i ? "border-pista-700" : "border-transparent"
            )}
            style={{ background: `linear-gradient(135deg, ${tint}10 0%, ${tint}24 100%)` }}
            aria-label={`${name} thumbnail ${i + 1}`}
          >
            <Leaf className="w-6 h-6 opacity-40" style={{ color: tint }} />
          </button>
        ))}
      </div>
    </div>
  );
}
