import clsx from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "forest" | "gold" | "orange" | "outline";
  size?: "sm" | "md";
}

/** Small pill label used for tags like "Best Seller", "New", certifications. */
export default function Badge({ children, tone = "forest", size = "sm" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 font-semibold uppercase tracking-wide rounded-full",
        size === "sm" ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5",
        tone === "forest" && "bg-forest-700 text-cream",
        tone === "gold" && "bg-gold text-forest-700",
        tone === "orange" && "bg-soft-orange text-white",
        tone === "outline" && "border border-pista-500 text-forest-700 bg-white"
      )}
    >
      {children}
    </span>
  );
}
