import clsx from "clsx";
import { formatCurrency } from "@/utils/formatCurrency";

interface PriceTagProps {
  price: number;
  discountPrice?: number;
  size?: "sm" | "md" | "lg";
}

/** Displays MRP with strikethrough + discounted price and % off when applicable. */
export default function PriceTag({ price, discountPrice, size = "md" }: PriceTagProps) {
  const hasDiscount = !!discountPrice && discountPrice < price;
  const pctOff = hasDiscount ? Math.round(((price - discountPrice!) / price) * 100) : 0;

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={clsx("font-semibold text-forest-700", size === "sm" && "text-sm", size === "md" && "text-base", size === "lg" && "text-2xl")}>
        {formatCurrency(hasDiscount ? discountPrice! : price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-xs text-brown-500 line-through">{formatCurrency(price)}</span>
          <span className="text-xs font-semibold text-soft-orange">{pctOff}% off</span>
        </>
      )}
    </div>
  );
}
