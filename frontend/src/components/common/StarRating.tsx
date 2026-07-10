import { Star } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

/** Read-only star rating display, optionally with review count text. */
export default function StarRating({ rating, reviewCount, size = "sm" }: StarRatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={clsx(starSize, i <= Math.round(rating) ? "fill-gold text-gold" : "text-beige fill-beige")}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-brown-500">({reviewCount})</span>
      )}
    </div>
  );
}
