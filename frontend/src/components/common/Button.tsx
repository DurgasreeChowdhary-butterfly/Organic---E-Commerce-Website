import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

/** Reusable premium button with brand variants, sizes, and loading state. */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "px-4 py-2 text-xs",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-base",
        variant === "primary" && "bg-forest-700 text-white shadow-soft hover:bg-forest-500 hover:shadow-glass",
        variant === "secondary" && "bg-gold text-forest-700 shadow-soft hover:opacity-90",
        variant === "outline" && "border-2 border-forest-700 text-forest-700 hover:bg-pista-50",
        variant === "ghost" && "text-forest-700 hover:bg-pista-50",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
