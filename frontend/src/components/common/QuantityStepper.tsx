import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

/** +/- quantity control used in cart rows and product detail pages. */
export default function QuantityStepper({ quantity, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-pista-300 overflow-hidden">
      <button
        type="button"
        disabled={quantity <= min}
        onClick={() => onChange(quantity - 1)}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-forest-700 hover:bg-pista-50 active:bg-pista-100 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-forest-700">{quantity}</span>
      <button
        type="button"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-forest-700 hover:bg-pista-50 active:bg-pista-100 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </button>
    </div>
  );
}
