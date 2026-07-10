import type { LucideIcon } from "lucide-react";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty-state block for empty cart/wishlist/orders/search results. */
export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-pista-50 flex items-center justify-center mb-5">
        <Icon className="w-9 h-9 text-pista-500" />
      </div>
      <h3 className="font-display text-xl text-forest-700 mb-2">{title}</h3>
      <p className="text-sm text-brown-500 max-w-sm mb-6">{description}</p>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
